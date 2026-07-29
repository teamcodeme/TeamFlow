package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("TeamFlow API starting on port %s...\n", port)
	fmt.Println("Generated code will be placed here by go-duck")

	// TODO: Initialize database, routes, and start server
	// This will be populated by go-duck generator
}
