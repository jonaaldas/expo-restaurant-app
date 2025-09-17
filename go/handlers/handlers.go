package handlers

import (
	"context"
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/jonaaldas/go-restaurant-crud/database"
	"github.com/jonaaldas/go-restaurant-crud/places"
	"github.com/jonaaldas/go-restaurant-crud/types"
	"go.mongodb.org/mongo-driver/mongo"
)

type Handlers struct {
	MongoCollection                *mongo.Collection
	MongoSavedRestaurantCollection *mongo.Collection
}

func NewHandlers(mongoCollection *mongo.Collection, mongoSavedRestaurantCollection *mongo.Collection) *Handlers {
	return &Handlers{
		MongoCollection:                mongoCollection,
		MongoSavedRestaurantCollection: mongoSavedRestaurantCollection,
	}
}

// SearchRestaurants handles GET /api/search
func (h *Handlers) SearchRestaurants(c *fiber.Ctx) error {
	query := c.Query("query")

	restaurants, err := places.GetPlacesByText(query, nil)

	if err != nil {
		fmt.Print(err)
		return c.Status(400).JSON(fiber.Map{
			"message": "Error searching",
		})
	}

	return c.JSON(fiber.Map{
		"data": restaurants,
	})
}

// GetRestaurant handles GET /api/restaurant/:placeId
func (h *Handlers) GetRestaurant(c *fiber.Ctx) error {
	placeId := c.Params("placeId")

	restaurant, err := database.GetRestaurantFromMongo(context.Background(), h.MongoSavedRestaurantCollection, placeId)
	if err != nil {
		log.Printf("Restaurant not found in MongoDB: %v", err)
		return c.Status(404).JSON(fiber.Map{
			"message": "Restaurant not found",
			"placeID": placeId,
		})
	}

	log.Printf("Found restaurant in MongoDB: %s", placeId)

	return c.JSON(fiber.Map{
		"data": restaurant,
	})
}

// SaveRestaurant handles POST /api/save
func (h *Handlers) SaveRestaurant(c *fiber.Ctx) error {
	r := new(types.Restaurant)

	if err := c.BodyParser(r); err != nil {
		log.Printf("Error parsing request body: %v", err)
		return c.Status(400).JSON(fiber.Map{
			"message": "Invalid request body",
		})
	}

	log.Printf("Attempting to save restaurant with PlaceID: %s", r.PlaceID)

	if r.PlaceID == "" {
		return c.Status(400).JSON(fiber.Map{
			"message": "PlaceID is required",
		})
	}

	err := database.InsertRestaurant(context.Background(), h.MongoSavedRestaurantCollection, *r)
	if err != nil {
		log.Println("Error saving restaurant:", err)
		return c.Status(500).JSON(fiber.Map{
			"message": "Error saving restaurant",
			"placeID": r.PlaceID,
		})
	}

	return c.JSON(fiber.Map{
		"message": "Restaurant saved successfully",
	})
}

// GetAllRestaurants handles GET /api/restaurants
func (h *Handlers) GetAllRestaurants(c *fiber.Ctx) error {
	restaurants, err := database.GetAllSavedRestaurants(context.Background(), h.MongoSavedRestaurantCollection)
	if err != nil {
		log.Printf("Error getting saved restaurants: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"message": "Error retrieving saved restaurants",
		})
	}

	return c.JSON(fiber.Map{
		"data":  restaurants,
		"count": len(restaurants),
	})
}

// GetAllRestaurantsIds handles GET /api/restaurants/ids
func (h *Handlers) GetAllRestaurantsIds(c *fiber.Ctx) error {
	// fetch all restaurants IDs from Mongo.
	restaurants, err := database.GetAllRestaurantsId(context.Background(), h.MongoSavedRestaurantCollection)
	if err != nil {
		log.Printf("Error getting saved restaurants ids: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"message": "Error retrieving saved restaurants ids",
		})
	}
	return c.JSON(fiber.Map{
		"data": restaurants,
	})
}
