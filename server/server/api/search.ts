import { defineEventHandler, readBody, createError, getQuery } from 'h3';
import { $fetch } from 'ofetch';

// Type definitions
interface Location {
  lat: number;
  lng: number;
}

interface AuthorAttribution {
  displayName: string;
  uri: string;
  photoUri: string;
}

interface Photo {
  name: string;
  widthPx: number;
  heightPx: number;
  authorAttributions: AuthorAttribution[];
  flagContentUri: string;
  googleMapsUri: string;
}

interface GoogleReviewsPhoto {
  height: number;
  html_attributions: string[];
  photo_reference: string;
  width: number;
}

interface GoogleReviewsReview {
  author_name: string;
  author_url: string;
  language: string;
  original_language: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
  translated: boolean;
}

interface GoogleReviewsResult {
  photos: GoogleReviewsPhoto[];
  rating: number;
  reviews: GoogleReviewsReview[];
}

interface GoogleReviewsReply {
  html_attributions: any[];
  result: GoogleReviewsResult;
  status: string;
}

interface GooglePhotoResponse {
  name: string;
  photoUri: string;
}

interface CurrentOpeningHours {
  open_now: boolean;
  weekday_descriptions: string[];
  next_close_time: string;
}

interface GoogleCurrentOpeningHours {
  openNow: boolean;
  weekdayDescriptions: string[];
  nextCloseTime: string;
}

interface Restaurant {
  name: string;
  rating: number;
  photos: GooglePhotoResponse[];
  location: Location;
  place_id: string;
  would_try: boolean;
  reviews: GoogleReviewsResult;
  formatted_address: string;
  price_level: string;
  website_uri: string;
  google_maps_uri: string;
  current_opening_hours: CurrentOpeningHours;
}

interface TextSearchRequest {
  textQuery: string;
}

interface TextSearchName {
  text: string;
  languageCode: string;
}

interface TextSearchLoc {
  latitude: number;
  longitude: number;
}

interface TextSearchPlace {
  id: string;
  formattedAddress: string;
  shortFormattedAddress: string;
  location: TextSearchLoc;
  rating: number;
  priceLevel?: string;
  userRatingCount: number;
  displayName: TextSearchName;
  photos?: Photo[];
  googleMapsUri: string;
  websiteUri: string;
  currentOpeningHours: GoogleCurrentOpeningHours;
}

interface TextSearchResponse {
  places: TextSearchPlace[];
}

// Helper function to fetch review photos data
async function fetchReviewPhotosData(
  reviewPhotos: GoogleReviewsPhoto[],
  apiKey: string
): Promise<GoogleReviewsPhoto[]> {
  if (!reviewPhotos || reviewPhotos.length === 0) {
    return [];
  }

  const photoPromises = reviewPhotos.map(async (photo) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photo.photo_reference}&key=${apiKey}&maxwidth=1920&maxheight=1080`;
      
      const response = await $fetch.raw(url, { redirect: 'follow' });
      
      // Get the final URL after redirects
      const finalURL = response.url;
      
      return {
        height: photo.height,
        width: photo.width,
        html_attributions: photo.html_attributions,
        photo_reference: finalURL, // Replace with actual photo URL
      };
    } catch (error) {
      console.error(`Failed to get photo data for reference ${photo.photo_reference.substring(0, 20)}:`, error);
      throw error;
    }
  });

  const results = await Promise.all(photoPromises);
  return results;
}

// Helper function to fetch text search place with reviews
async function fetchTextSearchPlaceWithReviews(
  place: TextSearchPlace,
  apiKey: string
): Promise<Restaurant> {
  try {
    // Fetch reviews
    const reviewsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.id}&fields=reviews,rating,photos&key=${apiKey}`;
    
    const reviewData: GoogleReviewsReply = await $fetch(reviewsUrl);
    
    // Use FormattedAddress if available, otherwise fall back to ShortFormattedAddress
    const address = place.formattedAddress || place.shortFormattedAddress;
    
    // Fetch photos for entire place concurrently
    let photos: GooglePhotoResponse[] = [];
    if (place.photos && place.photos.length > 0) {
      const photoPromises = place.photos.map(async (photo) => {
        try {
          const url = `https://places.googleapis.com/v1/${photo.name}/media?key=${apiKey}&maxHeightPx=1080&maxWidthPx=1920&skipHttpRedirect=true`;
          
          const photoData: GooglePhotoResponse = await $fetch(url);
          return photoData;
        } catch (error) {
          console.error(`Failed to get photo for ${place.displayName.text}:`, error);
          throw error;
        }
      });
      
      const photoResults = await Promise.all(photoPromises);
      photos = photoResults.filter(p => p.name || p.photoUri);
    }
    
    const restaurant: Restaurant = {
      name: place.displayName.text,
      rating: place.rating,
      photos: photos,
      location: {
        lat: place.location.latitude,
        lng: place.location.longitude,
      },
      place_id: place.id,
      would_try: false,
      reviews: reviewData.result || { photos: [], rating: 0, reviews: [] },
      formatted_address: address,
      price_level: place.priceLevel || '',
      website_uri: place.websiteUri || '',
      google_maps_uri: place.googleMapsUri || '',
      current_opening_hours: {
        open_now: place.currentOpeningHours?.openNow || false,
        weekday_descriptions: place.currentOpeningHours?.weekdayDescriptions || [],
        next_close_time: place.currentOpeningHours?.nextCloseTime || '',
      },
    };
    
    // Fetch actual photo data for review photos concurrently
    if (restaurant.reviews.photos && restaurant.reviews.photos.length > 0) {
      try {
        const updatedReviewPhotos = await fetchReviewPhotosData(restaurant.reviews.photos, apiKey);
        restaurant.reviews.photos = updatedReviewPhotos;
      } catch (error) {
        console.error(`Failed to fetch review photos data for ${restaurant.name}:`, error);
      }
    }
    
    return restaurant;
  } catch (error) {
    console.error(`Error fetching place with reviews for ${place.displayName.text}:`, error);
    throw error;
  }
}

// Main function to get places by text
export async function getPlacesByText(textQuery: string): Promise<Restaurant[]> {
  const apiKey = process.env.PLACES_API_KEY;
  if (!apiKey) {
    throw new Error('PLACES_API_KEY environment variable is not set');
  }
  
  try {
    const requestBody: TextSearchRequest = {
      textQuery: textQuery,
    };
    
    const url = 'https://places.googleapis.com/v1/places:searchText';
    
    const textSearchResponse: TextSearchResponse = await $fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.rating,places.priceLevel,places.userRatingCount,places.formattedAddress,places.shortFormattedAddress,places.photos,places.googleMapsUri,places.websiteUri,places.currentOpeningHours',
      },
      body: requestBody,
    });
    
    if (!textSearchResponse.places || textSearchResponse.places.length === 0) {
      return [];
    }
    
    // Fetch all places with reviews concurrently
    const placePromises = textSearchResponse.places.map(place => 
      fetchTextSearchPlaceWithReviews(place, apiKey)
    );
    
    const places = await Promise.all(placePromises);
    
    return places;
  } catch (error) {
    console.error('Failed to get places by text:', error);
    throw error;
  }
}

// Nitro API endpoint handler
export default defineEventHandler(async (event) => {
  const { query } = getQuery(event) as { query: string };
  
  if (!query) {
    throw createError({ statusCode: 400, statusMessage: 'Query parameter is required' });
  }
  
  try {
    const restaurants = await getPlacesByText(query);
    return {
      success: true,
      data: restaurants,
    };
  } catch (error) {
    console.error('Error in search API:', error);
    throw createError({ 
      statusCode: 500, 
      statusMessage: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});