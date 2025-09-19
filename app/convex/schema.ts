import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
export default defineSchema({
  ...authTables,
  savedRestaurants: defineTable({
    userId: v.optional(v.string()),
    name: v.string(),
    rating: v.float64(),
    photos: v.array(
      v.object({
        name: v.string(),
        photoUri: v.string(),
      })
    ),
    location: v.object({
      lat: v.float64(),
      lng: v.float64(),
    }),
    place_id: v.string(),
    would_try: v.boolean(),
    reviews: v.object({
      photos: v.array(
        v.object({
          height: v.float64(),
          html_attributions: v.array(v.string()),
          photo_reference: v.string(),
          width: v.float64(),
        })
      ),
      rating: v.float64(),
      reviews: v.array(
        v.object({
          author_name: v.string(),
          author_url: v.string(),
          language: v.string(),
          original_language: v.string(),
          profile_photo_url: v.string(),
          rating: v.float64(),
          relative_time_description: v.string(),
          text: v.string(),
          time: v.float64(),
          translated: v.boolean(),
        })
      ),
    }),
    formatted_address: v.string(),
    price_level: v.string(),
    website_uri: v.string(),
    google_maps_uri: v.string(),
    current_opening_hours: v.object({
      open_now: v.boolean(),
      weekday_descriptions: v.array(v.string()),
      next_close_time: v.string(),
    }),
    savedAt: v.float64(),
  })
    .index("by_user_id", ["userId"])
    .index("by_place_id", ["place_id"])
    .index("by_user_place", ["userId", "place_id"])
    .index("by_saved_at", ["savedAt"])
    .index("by_would_try", ["would_try"])
    .index("by_user_would_try", ["userId", "would_try"]),

  notes: defineTable({
    userId: v.optional(v.string()),
    restaurantPlaceId: v.string(),
    title: v.string(),
    content: v.string(),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index("by_user_id", ["userId"])
    .index("by_restaurant", ["restaurantPlaceId"])
    .index("by_user_restaurant", ["userId", "restaurantPlaceId"])
    .index("by_created_at", ["createdAt"])
    .index("by_updated_at", ["updatedAt"]),
});
