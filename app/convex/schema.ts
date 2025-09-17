import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  savedRestaurants: defineTable({
    name: v.string(),
    rating: v.float64(),
    photos: v.array(v.object({
      name: v.string(),
      photoUri: v.string(),
    })),
    location: v.object({
      lat: v.float64(),
      lng: v.float64(),
    }),
    placeId: v.string(),
    wouldTry: v.boolean(),
    reviews: v.object({
      photos: v.array(v.object({
        height: v.float64(),
        htmlAttributions: v.array(v.string()),
        photoReference: v.string(),
        width: v.float64(),
      })),
      rating: v.float64(),
      reviews: v.array(v.object({
        authorName: v.string(),
        authorUrl: v.string(),
        language: v.string(),
        originalLanguage: v.string(),
        profilePhotoUrl: v.string(),
        rating: v.float64(),
        relativeTimeDescription: v.string(),
        text: v.string(),
        time: v.float64(),
        translated: v.boolean(),
      })),
    }),
    formattedAddress: v.string(),
    priceLevel: v.string(),
    websiteUri: v.string(),
    googleMapsUri: v.string(),
    currentOpeningHours: v.object({
      openNow: v.boolean(),
      weekdayDescriptions: v.array(v.string()),
      nextCloseTime: v.string(),
    }),
    savedAt: v.float64(),
  })
  .index("by_place_id", ["placeId"])
  .index("by_saved_at", ["savedAt"])
  .index("by_would_try", ["wouldTry"]),
});
