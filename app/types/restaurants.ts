export interface SearchParams {
  query: string;
}

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
  photoUri: string;
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

interface CurrentOpeningHours {
  open_now: boolean;
  weekday_descriptions: string[];
  next_close_time: string;
}

interface Restaurant {
  name: string;
  rating: number;
  photos: Photo[];
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

interface RestaurantId {
  place_id: string;
  would_try: boolean;
}

export type { Restaurant, RestaurantId };