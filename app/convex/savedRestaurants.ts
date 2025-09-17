import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveRestaurant = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("savedRestaurants")
      .withIndex("by_place_id", (q) => q.eq("placeId", args.placeId))
      .first();

    if (existing) {
      throw new Error("Restaurant is already saved");
    }

    const restaurantId = await ctx.db.insert("savedRestaurants", {
      ...args,
      savedAt: Date.now(),
    });

    return restaurantId;
  },
});

export const removeRestaurant = mutation({
  args: {
    placeId: v.string(),
  },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db
      .query("savedRestaurants")
      .withIndex("by_place_id", (q) => q.eq("placeId", args.placeId))
      .first();

    if (!restaurant) {
      throw new Error("Restaurant not found in saved list");
    }

    await ctx.db.delete(restaurant._id);
    return { success: true };
  },
});

export const updateWouldTry = mutation({
  args: {
    placeId: v.string(),
    wouldTry: v.boolean(),
  },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db
      .query("savedRestaurants")
      .withIndex("by_place_id", (q) => q.eq("placeId", args.placeId))
      .first();

    if (!restaurant) {
      throw new Error("Restaurant not found in saved list");
    }

    await ctx.db.patch(restaurant._id, {
      wouldTry: args.wouldTry,
    });

    return { success: true };
  },
});

export const getSavedRestaurants = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("savedRestaurants")
      .withIndex("by_saved_at")
      .order("desc")
      .collect();
  },
});

export const getRestaurantsByWouldTry = query({
  args: {
    wouldTry: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("savedRestaurants")
      .withIndex("by_would_try", (q) => q.eq("wouldTry", args.wouldTry))
      .collect();
  },
});

export const isRestaurantSaved = query({
  args: {
    placeId: v.string(),
  },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db
      .query("savedRestaurants")
      .withIndex("by_place_id", (q) => q.eq("placeId", args.placeId))
      .first();

    return !!restaurant;
  },
});

export const getSavedRestaurant = query({
  args: {
    placeId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("savedRestaurants")
      .withIndex("by_place_id", (q) => q.eq("placeId", args.placeId))
      .first();
  },
});
