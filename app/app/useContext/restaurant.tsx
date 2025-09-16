import { Restaurant, SearchParams } from "@/types/restaurants";
import { createContext, useContext, useState, ReactNode } from "react";
import { searchRestaurants, saveRestaurant, fetchAllRestaurantsWithIds, fetchSavedRestaurants } from "@/utils/restaurants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "expo-router";
import { Alert } from "react-native";

interface RestaurantContextType {
  restaurants: Restaurant[];
  savedRestaurants: Restaurant[];
  searchRestaurants: (params: SearchParams) => void;
  saveRestaurant: (restaurantId: string) => void;
  restaurantsIds: string[] | [];
  isSearching: boolean;
  isSaving: boolean;
  isLoadingSaved: boolean;
  refetchSavedRestaurants: () => void;
}

export const RestaurantContext = createContext<
  RestaurantContextType | undefined
>(undefined);

interface RestaurantProviderProps {
  children: ReactNode;
}

export const RestaurantProvider = ({ children }: RestaurantProviderProps) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [savedRestaurants, setSavedRestaurants] = useState<Restaurant[]>([]);
  const [restaurantsIds, setRestaurantsIds] = useState<string[]>([]); 
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();
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

  useQuery({
    queryKey: ['restaurants-ids'], 
    queryFn: async () => {
      const res = await fetchAllRestaurantsWithIds();
      setRestaurantsIds(res);
      return res;
    }, 
    enabled: true 
  })

  const savedRestaurantsQuery = useQuery({
    queryKey: ['saved-restaurants'],
    queryFn: async () => {
      const res = await fetchSavedRestaurants();
      setSavedRestaurants(res);
      return res;
    },
    enabled: true
  })

  const saveRestaurantMutation = useMutation({
    mutationFn: (restaurantId: string) => {
      const restaurant = restaurants.find((restaurant) => restaurant.place_id === restaurantId);
      console.log(restaurant);
      if (!restaurant) {
        throw new Error("Restaurant not found");
      }
      return saveRestaurant(restaurant);
    },
    onSuccess: (data, restaurantId: string) => {
      queryClient.invalidateQueries({ queryKey: [`saved-${restaurantId}`] });
      const restaurant = restaurants.find((r) => r.place_id === restaurantId);
      Alert.alert(
        "Restaurant Saved! 🎉",
        `${restaurant?.name || "Restaurant"} has been added to your saved list.`,
        [{ text: "OK", style: "default" }]
      );
      queryClient.invalidateQueries({ queryKey: ['restaurants-ids'] });
      queryClient.invalidateQueries({ queryKey: ['saved-restaurants'] });
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

  const value: RestaurantContextType = {
    restaurants,
    savedRestaurants,
    searchRestaurants: searchRestaurantsMutation.mutate,
    saveRestaurant: saveRestaurantMutation.mutate,
    restaurantsIds: restaurantsIds,
    isSearching: searchRestaurantsMutation.isPending,
    isSaving: saveRestaurantMutation.isPending,
    isLoadingSaved: savedRestaurantsQuery.isLoading,
    refetchSavedRestaurants: savedRestaurantsQuery.refetch,
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
