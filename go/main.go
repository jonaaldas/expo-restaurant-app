package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"

	"github.com/joho/godotenv"
	"github.com/jonaaldas/go-restaurant-crud/handlers"
)

type GooglePhotoResponse struct {
	Name     string `json:"name"`
	PhotoUri string `json:"photoUri"`
}

func main() {
	// Try to load .env if present, but don't crash if missing.
	// In containers, env vars are usually injected by the orchestrator (docker-compose).
	if err := godotenv.Load(); err != nil {
		log.Printf(".env not found, relying on environment variables: %v", err)
	}

	// Basic sanity check: ensure required env like PLACES_API_KEY is present.
	if os.Getenv("PLACES_API_KEY") == "" {
		log.Println("warning: PLACES_API_KEY is empty; make sure it's set in env or .env")
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
