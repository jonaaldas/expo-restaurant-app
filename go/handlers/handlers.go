package handlers

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/jonaaldas/go-restaurant-crud/places"
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
