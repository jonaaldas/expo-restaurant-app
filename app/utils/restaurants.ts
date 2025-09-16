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

interface SaveRestaurantRes {
  data: string
}

interface GetAllRestaurantsWithIdsRes {
  data: string[]
}

export const searchRestaurants = async (params: SearchParams): Promise<Restaurant[]> => {
  const response: SearchResponse = await api('/search', {
    query: {
      query: params.query,
    },
  })
  return response.data;
}

export const saveRestaurant = async (restaurant: Restaurant) =>{
  try {
    const response: SaveRestaurantRes = await api("/save", {
      method: "POST",
      body: restaurant,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const fetchAllRestaurantsWithIds = async () => {
  const response: GetAllRestaurantsWithIdsRes = await api("/restaurants/ids");
  return response.data;
};

export const fetchSavedRestaurants = async (): Promise<Restaurant[]> => {
  const response: SearchResponse = await api("/restaurants");
  return response.data;
};