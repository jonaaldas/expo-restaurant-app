import { Doc } from "../convex/_generated/dataModel";

export type SavedRestaurant = Doc<"savedRestaurants">;

export interface RestaurantPhoto {
  name: string;
  photoUri: string;
}

export interface RestaurantLocation {
  lat: number;
  lng: number;
}

export interface RestaurantReviewPhoto {
  height: number;
  htmlAttributions: string[];
  photoReference: string;
  width: number;
}

export interface RestaurantReview {
  authorName: string;
  authorUrl: string;
  language: string;
  originalLanguage: string;
  profilePhotoUrl: string;
  rating: number;
  relativeTimeDescription: string;
  text: string;
  time: number;
  translated: boolean;
}

export interface RestaurantReviews {
  photos: RestaurantReviewPhoto[];
  rating: number;
  reviews: RestaurantReview[];
}

export interface RestaurantOpeningHours {
  openNow: boolean;
  weekdayDescriptions: string[];
  nextCloseTime: string;
}

export interface SaveRestaurantInput {
  name: string;
  rating: number;
  photos: RestaurantPhoto[];
  location: RestaurantLocation;
  placeId: string;
  wouldTry: boolean;
  reviews: RestaurantReviews;
  formattedAddress: string;
  priceLevel: string;
  websiteUri: string;
  googleMapsUri: string;
  currentOpeningHours: RestaurantOpeningHours;
}
