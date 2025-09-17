import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Restaurant } from "../types/restaurants";

export function useSavedRestaurants(userId?: string) {
  const savedRestaurants = useQuery(api.savedRestaurants.getSavedRestaurants, { userId });
  const saveRestaurant = useMutation(api.savedRestaurants.saveRestaurant);
  const removeRestaurant = useMutation(api.savedRestaurants.removeRestaurant);
  const updateWouldTry = useMutation(api.savedRestaurants.updateWouldTry);

  const handleSaveRestaurant = async (restaurant: Restaurant, userId?: string) => {
    try {
      await saveRestaurant({ ...restaurant, userId });
      return { success: true };
    } catch (error) {
      console.error("Failed to save restaurant:", error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const handleRemoveRestaurant = async (place_id: string, userId?: string) => {
    try {
      await removeRestaurant({ place_id, userId });
      return { success: true };
    } catch (error) {
      console.error("Failed to remove restaurant:", error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const handleUpdateWouldTry = async (place_id: string, would_try: boolean, userId?: string) => {
    try {
      await updateWouldTry({ place_id, would_try, userId });
      return { success: true };
    } catch (error) {
      console.error("Failed to update would try status:", error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  return {
    savedRestaurants,
    saveRestaurant: handleSaveRestaurant,
    removeRestaurant: handleRemoveRestaurant,
    updateWouldTry: handleUpdateWouldTry,
  };
}

export function useIsRestaurantSaved(place_id: string, userId?: string) {
  return useQuery(api.savedRestaurants.isRestaurantSaved, { place_id, userId });
}

export function useRestaurantsByWouldTry(would_try: boolean, userId?: string) {
  return useQuery(api.savedRestaurants.getRestaurantsByWouldTry, { would_try, userId });
}

export function useSavedRestaurant(place_id: string, userId?: string) {
  return useQuery(api.savedRestaurants.getSavedRestaurant, { place_id, userId });
}

export function useAllRestaurantIds(userId?: string) {
  return useQuery(api.savedRestaurants.getAllRestaurantIds, { userId });
}
