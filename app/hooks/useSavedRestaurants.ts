import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SaveRestaurantInput } from "../types/convex";

export function useSavedRestaurants() {
  const savedRestaurants = useQuery(api.savedRestaurants.getSavedRestaurants);
  const saveRestaurant = useMutation(api.savedRestaurants.saveRestaurant);
  const removeRestaurant = useMutation(api.savedRestaurants.removeRestaurant);
  const updateWouldTry = useMutation(api.savedRestaurants.updateWouldTry);

  const handleSaveRestaurant = async (restaurant: SaveRestaurantInput) => {
    try {
      await saveRestaurant(restaurant);
      return { success: true };
    } catch (error) {
      console.error("Failed to save restaurant:", error);
      return { success: false, error: error.message };
    }
  };

  const handleRemoveRestaurant = async (placeId: string) => {
    try {
      await removeRestaurant({ placeId });
      return { success: true };
    } catch (error) {
      console.error("Failed to remove restaurant:", error);
      return { success: false, error: error.message };
    }
  };

  const handleUpdateWouldTry = async (placeId: string, wouldTry: boolean) => {
    try {
      await updateWouldTry({ placeId, wouldTry });
      return { success: true };
    } catch (error) {
      console.error("Failed to update would try status:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    savedRestaurants,
    saveRestaurant: handleSaveRestaurant,
    removeRestaurant: handleRemoveRestaurant,
    updateWouldTry: handleUpdateWouldTry,
  };
}

export function useIsRestaurantSaved(placeId: string) {
  return useQuery(api.savedRestaurants.isRestaurantSaved, { placeId });
}

export function useRestaurantsByWouldTry(wouldTry: boolean) {
  return useQuery(api.savedRestaurants.getRestaurantsByWouldTry, { wouldTry });
}

export function useSavedRestaurant(placeId: string) {
  return useQuery(api.savedRestaurants.getSavedRestaurant, { placeId });
}
