import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createNote = mutation({
  args: {
    userId: v.optional(v.string()),
    restaurantPlaceId: v.string(),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const noteId = await ctx.db.insert("notes", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });

    return noteId;
  },
});

export const updateNote = mutation({
  args: {
    noteId: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { noteId, ...updates } = args;
    
    const updateData: any = {
      updatedAt: Date.now(),
    };
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.content !== undefined) updateData.content = updates.content;

    await ctx.db.patch(noteId, updateData);
    
    return { success: true };
  },
});

export const deleteNote = mutation({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.noteId);
    return { success: true };
  },
});

export const getNotesByRestaurant = query({
  args: {
    userId: v.optional(v.string()),
    restaurantPlaceId: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.userId) {
      return await ctx.db
        .query("notes")
        .withIndex("by_user_restaurant", (q) => 
          q.eq("userId", args.userId).eq("restaurantPlaceId", args.restaurantPlaceId)
        )
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("notes")
      .withIndex("by_restaurant", (q) => q.eq("restaurantPlaceId", args.restaurantPlaceId))
      .order("desc")
      .collect();
  },
});

export const getAllNotesByUser = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return [];
    }

    return await ctx.db
      .query("notes")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getNote = query({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.noteId);
  },
});

export const getRecentNotes = query({
  args: {
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    if (args.userId) {
      return await ctx.db
        .query("notes")
        .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
        .order("desc")
        .take(limit);
    }

    return await ctx.db
      .query("notes")
      .withIndex("by_updated_at")
      .order("desc")
      .take(limit);
  },
});

export const searchNotes = query({
  args: {
    userId: v.optional(v.string()),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return [];
    }

    const allNotes = await ctx.db
      .query("notes")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    // Filter notes by search term in title or content
    const searchLower = args.searchTerm.toLowerCase();
    return allNotes.filter(note => 
      note.title.toLowerCase().includes(searchLower) ||
      note.content.toLowerCase().includes(searchLower)
    );
  },
});

export const getNotesCount = query({
  args: {
    userId: v.optional(v.string()),
    restaurantPlaceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.restaurantPlaceId && args.userId) {
      const notes = await ctx.db
        .query("notes")
        .withIndex("by_user_restaurant", (q) => 
          q.eq("userId", args.userId).eq("restaurantPlaceId", args.restaurantPlaceId)
        )
        .collect();
      return notes.length;
    }
    
    if (args.userId) {
      const notes = await ctx.db
        .query("notes")
        .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
        .collect();
      return notes.length;
    }

    return 0;
  },
});
