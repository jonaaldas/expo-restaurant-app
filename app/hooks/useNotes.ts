import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

export function useNotes(userId?: string) {
  const createNote = useMutation(api.notes.createNote);
  const updateNote = useMutation(api.notes.updateNote);
  const deleteNote = useMutation(api.notes.deleteNote);

  const handleCreateNote = async (
    restaurantPlaceId: string,
    title: string,
    content: string,
    userId?: string
  ) => {
    try {
      await createNote({ restaurantPlaceId, title, content, userId });
      return { success: true };
    } catch (error) {
      console.error("Failed to create note:", error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const handleUpdateNote = async (
    noteId: Id<"notes">,
    updates: { title?: string; content?: string }
  ) => {
    try {
      await updateNote({ noteId, ...updates });
      return { success: true };
    } catch (error) {
      console.error("Failed to update note:", error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const handleDeleteNote = async (noteId: Id<"notes">) => {
    try {
      await deleteNote({ noteId });
      return { success: true };
    } catch (error) {
      console.error("Failed to delete note:", error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  return {
    createNote: handleCreateNote,
    updateNote: handleUpdateNote,
    deleteNote: handleDeleteNote,
  };
}

export function useNotesByRestaurant(restaurantPlaceId: string, userId?: string) {
  return useQuery(api.notes.getNotesByRestaurant, { restaurantPlaceId, userId });
}

export function useAllNotesByUser(userId?: string) {
  return useQuery(api.notes.getAllNotesByUser, { userId });
}

export function useNote(noteId: Id<"notes">) {
  return useQuery(api.notes.getNote, { noteId });
}

export function useRecentNotes(userId?: string, limit?: number) {
  return useQuery(api.notes.getRecentNotes, { userId, limit });
}

export function useSearchNotes(userId?: string, searchTerm?: string) {
  return useQuery(
    api.notes.searchNotes, 
    searchTerm ? { userId, searchTerm } : "skip"
  );
}

export function useNotesCount(userId?: string, restaurantPlaceId?: string) {
  return useQuery(api.notes.getNotesCount, { userId, restaurantPlaceId });
}
