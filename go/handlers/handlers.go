package handlers

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/jonaaldas/go-restaurant-crud/places"
)

type Handlers struct{}

func NewHandlers() *Handlers {
	return &Handlers{}
}

// SearchRestaurants handles GET /api/search
func (h *Handlers) SearchRestaurants(c *fiber.Ctx) error {
	query := c.Query("query")

	restaurants, err := places.GetPlacesByText(query)

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
