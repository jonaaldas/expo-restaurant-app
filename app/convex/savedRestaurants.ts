import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
export const saveRestaurant = mutation({
  args: {
    userId: v.optional(v.string()),
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
    place_id: v.string(),
    would_try: v.boolean(),
    reviews: v.object({
      photos: v.array(v.object({
        height: v.float64(),
        html_attributions: v.array(v.string()),
        photo_reference: v.string(),
        width: v.float64(),
      })),
      rating: v.float64(),
      reviews: v.array(v.object({
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
      })),
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
  },
  handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
          return null;
        }
    args.userId = userId;
    const existing = await ctx.db
      .query("savedRestaurants")
      .withIndex("by_user_place", (q) => 
        q.eq("userId", userId).eq("place_id", args.place_id)
      )
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
    place_id: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const restaurant = await ctx.db
      .query("savedRestaurants")
      .withIndex("by_user_place", (q) => 
        q.eq("userId", userId).eq("place_id", args.place_id)
      )
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
    place_id: v.string(),
    would_try: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const restaurant = await ctx.db
      .query("savedRestaurants")
      .withIndex("by_user_place", (q) => 
        q.eq("userId", userId).eq("place_id", args.place_id)
      )
      .first();

    if (!restaurant) {
      throw new Error("Restaurant not found in saved list");
    }

    await ctx.db.patch(restaurant._id, {
      would_try: args.would_try,
    });

    return { success: true };
  },
});

export const getSavedRestaurants = query({
  args: {
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    if (userId) {
      return await ctx.db
        .query("savedRestaurants")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .order("desc")
        .collect();
    }
    
    return await ctx.db
      .query("savedRestaurants")
      .withIndex("by_saved_at")
      .order("desc")
      .collect();
  },
});

export const getRestaurantsByWouldTry = query({
  args: {
    would_try: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    if (userId) {
      return await ctx.db
        .query("savedRestaurants")
        .withIndex("by_user_would_try", (q) => 
          q.eq("userId", userId).eq("would_try", args.would_try)
        )
        .collect();
    }

    return await ctx.db
      .query("savedRestaurants")
      .withIndex("by_would_try", (q) => q.eq("would_try", args.would_try))
      .collect();
  },
});

export const isRestaurantSaved = query({
  args: {
    place_id: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const restaurant = await ctx.db
      .query("savedRestaurants")
      .withIndex("by_user_place", (q) => 
        q.eq("userId", userId).eq("place_id", args.place_id)
      )
      .first();

    return !!restaurant;
  },
});

export const getSavedRestaurant = query({
  args: {
    place_id: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db
      .query("savedRestaurants")
      .withIndex("by_user_place", (q) => 
        q.eq("userId", userId).eq("place_id", args.place_id)
      )
      .first();
  },
});

export const getAllRestaurantIds = query({
  args: {
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    let restaurants;
    
    if (userId) {
      restaurants = await ctx.db
        .query("savedRestaurants")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .collect();
    } else {
      restaurants = await ctx.db
        .query("savedRestaurants")
        .collect();
    }
    
    return restaurants.map(restaurant => restaurant.place_id);
  },
});