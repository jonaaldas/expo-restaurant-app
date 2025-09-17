package places

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/jonaaldas/go-restaurant-crud/types"
	"github.com/redis/go-redis/v9"
)

func GetPlacesByText(textQuery string, redisClient *redis.Client) ([]types.Restaurant, error) {
	apiKey := os.Getenv("PLACES_API_KEY")
	if apiKey == "" {
		return []types.Restaurant{}, fmt.Errorf("PLACES_API_KEY environment variable is not set")
	}

	requestBody := types.TextSearchRequest{
		TextQuery: textQuery,
	}

	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return []types.Restaurant{}, fmt.Errorf("failed to marshal request body: %w", err)
	}

	url := "https://places.googleapis.com/v1/places:searchText"
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return []types.Restaurant{}, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Goog-Api-Key", apiKey)
	req.Header.Set("X-Goog-FieldMask", "places.id,places.displayName,places.location,places.rating,places.priceLevel,places.userRatingCount,places.formattedAddress,places.shortFormattedAddress,places.photos,places.googleMapsUri,places.websiteUri,places.currentOpeningHours")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Failed to make request: %v", err)
		return []types.Restaurant{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return []types.Restaurant{}, fmt.Errorf("text search HTTP %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Failed to read body: %v", err)
		return []types.Restaurant{}, err
	}

	var textSearchResponse types.TextSearchResponse
	if err := json.Unmarshal(body, &textSearchResponse); err != nil {
		log.Printf("Failed to parse JSON: %v", err)
		return []types.Restaurant{}, err
	}

	if len(textSearchResponse.Places) == 0 {
		return []types.Restaurant{}, nil
	}

	places := make([]types.Restaurant, len(textSearchResponse.Places))
	var wg sync.WaitGroup
	errChan := make(chan error, len(textSearchResponse.Places))

	for i, place := range textSearchResponse.Places {
		wg.Add(1)
		go func(index int, p types.TextSearchPlace) {
			defer wg.Done()

			restaurant, reviewsErr := fetchTextSearchPlaceWithReviews(p, apiKey)
			if reviewsErr != nil {
				errChan <- reviewsErr
				return
			}
			places[index] = restaurant
		}(i, place)
	}

	wg.Wait()
	close(errChan)

	if len(errChan) > 0 {
		return []types.Restaurant{}, <-errChan
	}

	return places, nil
}

func fetchTextSearchPlaceWithReviews(place types.TextSearchPlace, apiKey string) (types.Restaurant, error) {
	reviewsUrl := fmt.Sprintf("https://maps.googleapis.com/maps/api/place/details/json?place_id=%s&fields=reviews,rating,photos&key=%s", place.ID, apiKey)

	reviewRes, err := http.Get(reviewsUrl)
	if err != nil {
		return types.Restaurant{}, fmt.Errorf("failed to get reviews for %s: %w", place.DisplayName.Text, err)
	}
	defer reviewRes.Body.Close()

	reviewBody, err := io.ReadAll(reviewRes.Body)
	if err != nil {
		return types.Restaurant{}, fmt.Errorf("failed to read review body for %s: %w", place.DisplayName.Text, err)
	}

	var reviewResponse types.GoogleReviewsReply
	if err := json.Unmarshal(reviewBody, &reviewResponse); err != nil {
		return types.Restaurant{}, fmt.Errorf("failed to parse reviews JSON for %s: %w", place.DisplayName.Text, err)
	}

	// Use FormattedAddress if available, otherwise fall back to ShortFormattedAddress
	address := place.FormattedAddress
	if address == "" {
		address = place.ShortFormattedAddress
	}

	// fetch photos for entire place concurrently
	var photos []types.GooglePhotoResponse
	if len(place.Photos) > 0 {
		photoResults := make([]types.GooglePhotoResponse, len(place.Photos))
		var photoWg sync.WaitGroup
		photoErrChan := make(chan error, len(place.Photos))

		for i, photo := range place.Photos {
			photoWg.Add(1)
			go func(index int, p types.Photo) {
				defer photoWg.Done()

				url := fmt.Sprintf("https://places.googleapis.com/v1/%s/media?key=%s&maxHeightPx=1080&maxWidthPx=1920&skipHttpRedirect=true", p.Name, apiKey)
				res, err := http.Get(url)
				if err != nil {
					photoErrChan <- fmt.Errorf("failed to get photo for %s: %w", place.DisplayName.Text, err)
					return
				}
				defer res.Body.Close()

				body, err := io.ReadAll(res.Body)
				if err != nil {
					photoErrChan <- fmt.Errorf("failed to read photo response for %s: %w", place.DisplayName.Text, err)
					return
				}

				var photoResponse types.GooglePhotoResponse
				if err := json.Unmarshal(body, &photoResponse); err != nil {
					photoErrChan <- fmt.Errorf("failed to parse photo JSON for %s: %w", place.DisplayName.Text, err)
					return
				}

				photoResults[index] = photoResponse
			}(i, photo)
		}

		photoWg.Wait()
		close(photoErrChan)

		if len(photoErrChan) > 0 {
			return types.Restaurant{}, <-photoErrChan
		}

		for _, photoResult := range photoResults {
			if photoResult.Name != "" || photoResult.PhotoUri != "" {
				photos = append(photos, photoResult)
			}
		}
	}

	restaurant := types.Restaurant{
		Name:   place.DisplayName.Text,
		Rating: place.Rating,
		Photos: photos,
		Location: types.Location{
			Lat: place.Location.Latitude,
			Lng: place.Location.Longitude,
		},
		PlaceID:          place.ID,
		WouldTry:         false,
		Reviews:          reviewResponse.Result,
		FormattedAddress: address,
		PriceLevel:       place.PriceLevel,
		WebsiteURI:       place.WebsiteURI,
		GoogleMapsURI:    place.GoogleMapsURI,
		CurrentOpeningHours: types.CurrentOpeningHours{
			OpenNow:             place.CurrentOpeningHours.OpenNow,
			WeekdayDescriptions: place.CurrentOpeningHours.WeekdayDescriptions,
			NextCloseTime:       place.CurrentOpeningHours.NextCloseTime,
		},
	}

	// Fetch actual photo data for review photos concurrently
	if len(restaurant.Reviews.Photos) > 0 {
		updatedReviewPhotos, err := fetchReviewPhotosData(restaurant.Reviews.Photos, apiKey)
		if err != nil {
			log.Printf("Failed to fetch review photos data for %s: %v", restaurant.Name, err)
		} else {
			restaurant.Reviews.Photos = updatedReviewPhotos
		}
	}

	return restaurant, nil
}

func fetchReviewPhotosData(reviewPhotos []types.GoogleReviewsPhoto, apiKey string) ([]types.GoogleReviewsPhoto, error) {
	if len(reviewPhotos) == 0 {
		return []types.GoogleReviewsPhoto{}, nil
	}

	// Fetch photo data concurrently
	photoResults := make([]types.GoogleReviewsPhoto, len(reviewPhotos))
	var photoWg sync.WaitGroup
	photoErrChan := make(chan error, len(reviewPhotos))

	for i, reviewPhoto := range reviewPhotos {
		photoWg.Add(1)
		go func(index int, photo types.GoogleReviewsPhoto) {
			defer photoWg.Done()

			// Make API call to get actual photo data
			url := fmt.Sprintf("https://maps.googleapis.com/maps/api/place/photo?photoreference=%s&key=%s&maxwidth=1920&maxheight=1080", photo.PhotoReference, apiKey)

			res, err := http.Get(url)
			if err != nil {
				photoErrChan <- fmt.Errorf("failed to get photo data for reference %s: %w", photo.PhotoReference[:20], err)
				return
			}
			defer res.Body.Close()

			// The Google Maps API returns the actual image, but we want the URL
			// So we'll use the final URL after any redirects
			finalURL := res.Request.URL.String()

			// Create updated photo with the final URL
			updatedPhoto := types.GoogleReviewsPhoto{
				Height:           photo.Height,
				Width:            photo.Width,
				HTMLAttributions: photo.HTMLAttributions,
				PhotoReference:   finalURL, // Replace with actual photo URL
			}

			photoResults[index] = updatedPhoto
		}(i, reviewPhoto)
	}

	photoWg.Wait()
	close(photoErrChan)

	// Check for any errors
	if len(photoErrChan) > 0 {
		return []types.GoogleReviewsPhoto{}, <-photoErrChan
	}

	return photoResults, nil
}
