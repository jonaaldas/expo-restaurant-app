import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Restaurant } from "../types/restaurants";

export function useSavedRestaurants() {
  const savedRestaurants = useQuery(api.savedRestaurants.getSavedRestaurants);
  const saveRestaurant = useMutation(api.savedRestaurants.saveRestaurant);
  const removeRestaurant = useMutation(api.savedRestaurants.removeRestaurant);
  const updateWouldTry = useMutation(api.savedRestaurants.updateWouldTry);

  const handleSaveRestaurant = async (restaurant: Restaurant) => {
    try {
      await saveRestaurant({ ...restaurant});
      return { success: true };
    } catch (error) {
      console.error("Failed to save restaurant:", error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const handleRemoveRestaurant = async (place_id: string) => {
    try {
      await removeRestaurant({ place_id });
      return { success: true };
    } catch (error) {
      console.error("Failed to remove restaurant:", error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const handleUpdateWouldTry = async (place_id: string, would_try: boolean) => {
    try {
      await updateWouldTry({ place_id, would_try });
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

  export function useIsRestaurantSaved(place_id: string) {
  return useQuery(api.savedRestaurants.isRestaurantSaved, { place_id });
}

export function useRestaurantsByWouldTry(would_try: boolean) {
  return useQuery(api.savedRestaurants.getRestaurantsByWouldTry, { would_try });
}

export function useSavedRestaurant(place_id: string) {
  return useQuery(api.savedRestaurants.getSavedRestaurant, { place_id });
}

export function useAllRestaurantIds() {
  return useQuery(api.savedRestaurants.getAllRestaurantIds);
}
