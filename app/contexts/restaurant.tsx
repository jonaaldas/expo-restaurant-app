import { Restaurant, SearchParams } from "@/types/restaurants";
import { createContext, useContext, useState, ReactNode } from "react";
import { searchRestaurants } from "@/utils/restaurants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "expo-router";
import { Alert } from "react-native";
import { useSavedRestaurants, useAllRestaurantIds } from "@/hooks/useSavedRestaurants";
import { useNotes, useNotesByRestaurant, useAllNotesByUser, useRecentNotes } from "@/hooks/useNotes";

interface RestaurantContextType {
  restaurants: Restaurant[];
  savedRestaurants: Restaurant[];
  searchRestaurants: (params: SearchParams) => void;
  saveRestaurant: (restaurantId: string) => void;
  removeRestaurant: (restaurantId: string) => void;
  getAllSavedRestaurants: () => Restaurant[];
  restaurantsIds: string[];
  isSearching: boolean;
  isSaving: boolean;
  isLoadingSaved: boolean;
  isRemoving: boolean;
  // Notes functions
  createNote: (restaurantPlaceId: string, title: string, content: string) => Promise<{ success: boolean; error?: string }>;
  updateNote: (noteId: string, updates: { title?: string; content?: string }) => Promise<{ success: boolean; error?: string }>;
  deleteNote: (noteId: string) => Promise<{ success: boolean; error?: string }>;
  getNotesByRestaurant: (restaurantPlaceId: string) => any[];
  getAllUserNotes: () => any[];
  getRecentNotes: (limit?: number) => any[];
  isCreatingNote: boolean;
  isUpdatingNote: boolean;
  isDeletingNote: boolean;
}

export const RestaurantContext = createContext<
  RestaurantContextType | undefined
>(undefined);

interface RestaurantProviderProps {
  children: ReactNode;
}

export const RestaurantProvider = ({ children }: RestaurantProviderProps) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const userId = "1";
  
  // Use Convex hooks for saved restaurants
  const { 
    savedRestaurants, 
    saveRestaurant: convexSaveRestaurant, 
    removeRestaurant: convexRemoveRestaurant 
  } = useSavedRestaurants(userId);
  
  const restaurantIds = useAllRestaurantIds(userId);

  // Use Convex hooks for notes
  const { 
    createNote: convexCreateNote, 
    updateNote: convexUpdateNote, 
    deleteNote: convexDeleteNote 
  } = useNotes(userId);
  
  // Additional notes queries
  const allUserNotes = useAllNotesByUser(userId);
  const recentNotes = useRecentNotes(userId, 10);

  const searchRestaurantsMutation = useMutation({
    mutationFn: (params: SearchParams) => searchRestaurants(params),
    onSuccess: (val: Restaurant[]) => {
      queryClient.invalidateQueries({ queryKey: ["search-restaurants"] });
      setRestaurants(val);
      if (pathname !== "/restaurants") {
          router.push("/restaurants");
      }
    },
    onError: (error) => {
      console.error("Search restaurants error:", error);
    }
  });

  const saveRestaurantMutation = useMutation({
    mutationFn: async (restaurantId: string) => {
      const restaurant = restaurants.find((restaurant) => restaurant.place_id === restaurantId);
      if (!restaurant) {
        throw new Error("Restaurant not found");
      }
      return await convexSaveRestaurant(restaurant, userId);
    },
    onSuccess: (data, restaurantId: string) => {
      const restaurant = restaurants.find((r) => r.place_id === restaurantId);
      Alert.alert(
        "Restaurant Saved! 🎉",
        `${restaurant?.name || "Restaurant"} has been added to your saved list.`,
        [{ text: "OK", style: "default" }]
      );
    },
    onError: (error) => {
      console.log(error);
      console.error("Save restaurant error:", error);
      Alert.alert(
        "Save Failed",
        "Something went wrong while saving the restaurant. Please try again.",
        [{ text: "OK", style: "default" }]
      );
    }
  });

  const removeRestaurantMutation = useMutation({
    mutationFn: async (restaurantId: string) => {
      return await convexRemoveRestaurant(restaurantId, userId);
    },
    onSuccess: (data, restaurantId: string) => {
      const restaurant = savedRestaurants?.find((r) => r.place_id === restaurantId);
      Alert.alert(
        "Restaurant Removed",
        `${restaurant?.name || "Restaurant"} has been removed from your saved list.`,
        [{ text: "OK", style: "default" }]
      );
    },
    onError: (error) => {
      console.log(error);
      console.error("Remove restaurant error:", error);
      Alert.alert(
        "Remove Failed",
        "Something went wrong while removing the restaurant. Please try again.",
        [{ text: "OK", style: "default" }]
      );
    }
  });

  const getAllSavedRestaurants = () => {
    return savedRestaurants || [];
  };

  // Notes mutations
  const createNoteMutation = useMutation({
    mutationFn: async ({ restaurantPlaceId, title, content }: { restaurantPlaceId: string; title: string; content: string }) => {
      return await convexCreateNote(restaurantPlaceId, title, content, userId);
    },
    onSuccess: () => {
      Alert.alert("Success", "Note created successfully!");
    },
    onError: (error) => {
      console.error("Create note error:", error);
      Alert.alert("Error", "Failed to create note. Please try again.");
    }
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ noteId, updates }: { noteId: string; updates: { title?: string; content?: string } }) => {
      return await convexUpdateNote(noteId as any, updates);
    },
    onSuccess: () => {
      Alert.alert("Success", "Note updated successfully!");
    },
    onError: (error) => {
      console.error("Update note error:", error);
      Alert.alert("Error", "Failed to update note. Please try again.");
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      return await convexDeleteNote(noteId as any);
    },
    onSuccess: () => {
      Alert.alert("Success", "Note deleted successfully!");
    },
    onError: (error) => {
      console.error("Delete note error:", error);
      Alert.alert("Error", "Failed to delete note. Please try again.");
    }
  });

  // Notes helper functions
  const handleCreateNote = async (restaurantPlaceId: string, title: string, content: string) => {
    try {
      await createNoteMutation.mutateAsync({ restaurantPlaceId, title, content });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const handleUpdateNote = async (noteId: string, updates: { title?: string; content?: string }) => {
    try {
      await updateNoteMutation.mutateAsync({ noteId, updates });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNoteMutation.mutateAsync(noteId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const getNotesByRestaurant = (restaurantPlaceId: string) => {
    // This will be handled by a separate hook in components that need it
    // since useNotesByRestaurant is a hook and can't be called conditionally
    // Components should use the useNotesByRestaurant hook directly
    return [];
  };

  const getAllUserNotes = () => {
    return allUserNotes || [];
  };

  const getRecentUserNotes = (limit?: number) => {
    // Already fetching 10 recent notes, but this allows components to filter further
    return recentNotes ? recentNotes.slice(0, limit || 10) : [];
  };

  const value: RestaurantContextType = {
    restaurants,
    savedRestaurants: savedRestaurants || [],
    searchRestaurants: searchRestaurantsMutation.mutate,
    saveRestaurant: saveRestaurantMutation.mutate,
    removeRestaurant: removeRestaurantMutation.mutate,
    getAllSavedRestaurants,
    restaurantsIds: restaurantIds || [],
    isSearching: searchRestaurantsMutation.isPending,
    isSaving: saveRestaurantMutation.isPending,
    isLoadingSaved: false, // Convex handles loading states automatically
    isRemoving: removeRestaurantMutation.isPending,
    // Notes functions
    createNote: handleCreateNote,
    updateNote: handleUpdateNote,
    deleteNote: handleDeleteNote,
    getNotesByRestaurant,
    getAllUserNotes,
    getRecentNotes: getRecentUserNotes,
    isCreatingNote: createNoteMutation.isPending,
    isUpdatingNote: updateNoteMutation.isPending,
    isDeletingNote: deleteNoteMutation.isPending,
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurantContext = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error(
      "useRestaurantContext must be used within a RestaurantProvider"
    );
  }
  return context;
};
