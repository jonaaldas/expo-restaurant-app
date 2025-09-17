package database

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/jonaaldas/go-restaurant-crud/types"
	"github.com/redis/go-redis/v9"
)

func InitRedis() *redis.Client {
	var Rdb = redis.NewClient(&redis.Options{
		// TODO: Make redis secure before production
		Addr:     "65.109.128.10:6379",
		Password: "",
		DB:       0, // use default DB
	})
	return Rdb
}

func SetRestaurant(ctx context.Context, redisDb *redis.Client, placeId string, restaurant types.Restaurant) bool {
	jsonData, err := json.Marshal(restaurant)
	if err != nil {
		log.Printf("Failed to marshal restaurant: %v", err)
		return false
	}

	key := fmt.Sprintf("restaurant_%s", placeId)
	err = redisDb.Set(ctx, key, jsonData, 7*24*time.Hour).Err()

	if err != nil {
		log.Printf("Failed to cache restaurant: %v", err)
		return false
	}

	return true
}

func GetRestaurant(ctx context.Context, redisDb *redis.Client, placeId string) (*types.Restaurant, error) {
	key := fmt.Sprintf("restaurant_%s", placeId)
	res, err := redisDb.Get(ctx, key).Result()

	if err == redis.Nil {
		return nil, fmt.Errorf("restaurant not found: %s", placeId)
	}

	if err != nil {
		return nil, fmt.Errorf("redis error: %w", err)
	}

	var restaurant types.Restaurant
	if err := json.Unmarshal([]byte(res), &restaurant); err != nil {
		return nil, fmt.Errorf("unmarshal error: %w", err)
	}

	return &restaurant, nil
}

func SetTextSearch(ctx context.Context, redisDb *redis.Client, cacheKey string, restaurants []types.Restaurant) bool {
	jsonData, err := json.Marshal(restaurants)
	if err != nil {
		log.Printf("Failed to marshal restaurants for text search: %v", err)
		return false
	}

	redisErr := redisDb.Set(ctx, cacheKey, jsonData, 7*24*time.Hour).Err()
	if redisErr != nil {
		log.Printf("Redis set error for text search: %v", redisErr)
		return false
	}
	return true
}

func GetTextSearch(ctx context.Context, redisDb *redis.Client, cacheKey string) ([]types.Restaurant, bool) {
	res, err := redisDb.Get(ctx, cacheKey).Result()

	if err == redis.Nil {
		// Cache miss - not an error, just not found
		return []types.Restaurant{}, false
	}

	if err != nil {
		// Actual Redis error
		log.Printf("Redis error for text search: %v", err)
		return []types.Restaurant{}, false
	}

	var restaurants []types.Restaurant
	if err := json.Unmarshal([]byte(res), &restaurants); err != nil {
		log.Printf("Unmarshal error for text search: %v", err)
		return []types.Restaurant{}, false
	}

	return restaurants, true // true = found in cache
}
