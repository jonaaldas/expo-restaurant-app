package types

type Restaurant struct {
	Name                string                `json:"name"`
	Rating              float64               `json:"rating"`
	Photos              []GooglePhotoResponse `json:"photos"`
	Location            Location              `json:"location"`
	PlaceID             string                `json:"place_id"`
	WouldTry            bool                  `json:"would_try"`
	Reviews             GoogleReviewsResult   `json:"reviews"`
	FormattedAddress    string                `json:"formatted_address"`
	PriceLevel          string                `json:"price_level"`
	WebsiteURI          string                `json:"website_uri"`
	GoogleMapsURI       string                `json:"google_maps_uri"`
	CurrentOpeningHours CurrentOpeningHours   `json:"current_opening_hours"`
}

type RestaurantId struct {
	PlaceID  string `json:"place_id"`
	WouldTry bool   `json:"would_try"`
}
