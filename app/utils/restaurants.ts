import {ofetch} from 'ofetch';
import { Restaurant } from '@/types/restaurants';

const api = ofetch.create({
  baseURL: 'http://localhost:3000/api',
})

interface SearchParams {
  query: string;
}

interface SearchResponse {
  data: Restaurant[];
}

// Unused interfaces - kept for reference
// interface SaveRestaurantRes { data: string }
// interface GetAllRestaurantsWithIdsRes { data: string[] }

export const searchRestaurants = async (params: SearchParams): Promise<Restaurant[]> => {
  const response: SearchResponse = await api('/search', {
    query: {
      query: params.query,
    },
  })
  return response.data;
}

// These functions are no longer used - we now use Convex for all CRUD operations
// Keeping them here for reference, but they're not called by the frontend anymore

// export const saveRestaurant = async (restaurant: Restaurant) => { ... }
// export const fetchAllRestaurantsWithIds = async () => { ... }  
// export const fetchSavedRestaurants = async (): Promise<Restaurant[]> => { ... }