package main

import (
	"log"

	"github.com/gofiber/fiber/v2"

	"github.com/joho/godotenv"
	"github.com/jonaaldas/go-restaurant-crud/handlers"
)

type GooglePhotoResponse struct {
	Name     string `json:"name"`
	PhotoUri string `json:"photoUri"`
}

func main() {
	envErr := godotenv.Load()
	if envErr != nil {
		log.Fatal("Error loading .env file")
	}

	// Initialize handlers
	h := handlers.NewHandlers()

	app := fiber.New()

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, World!")
	})

	app.Get("/ping", func(c *fiber.Ctx) error {
		return c.SendString("pong")
	})

	// search restaurants
	app.Get("/api/search", h.SearchRestaurants)

	app.Listen(":3000")
}
