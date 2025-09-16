package database

import (
	"context"
	"fmt"
	"os"

	"github.com/jonaaldas/go-restaurant-crud/types"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func InitMongo() (*mongo.Client, error) {
	mongoURL := os.Getenv("MONGO_URL")
	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	opts := options.Client().ApplyURI(mongoURL).SetServerAPIOptions(serverAPI)
	client, err := mongo.Connect(context.TODO(), opts)
	if err != nil {
		return nil, err
	}
	// Send a ping to confirm a successful connection
	if err := client.Database("admin").RunCommand(context.TODO(), bson.D{{Key: "ping", Value: 1}}).Err(); err != nil {
		return nil, err
	}
	fmt.Println("Pinged your deployment. You successfully connected to MongoDB!")
	return client, nil
}

func InsertRestaurant(ctx context.Context, collection *mongo.Collection, restaurant types.Restaurant) error {
	_, err := collection.InsertOne(ctx, restaurant)

	if err != nil {
		fmt.Println("Error inserting restaurant:", err)
		return err
	}

	return nil
}

func GetRestaurantFromMongo(ctx context.Context, collection *mongo.Collection, placeID string) (*types.Restaurant, error) {
	filter := bson.M{"placeid": placeID}
	fmt.Print(filter)

	var restaurant types.Restaurant
	err := collection.FindOne(ctx, filter).Decode(&restaurant)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("restaurant with placeID %s not found in MongoDB", placeID)
		}
		return nil, fmt.Errorf("error finding restaurant in MongoDB: %w", err)
	}

	return &restaurant, nil
}

func UpsertRestaurant(ctx context.Context, collection *mongo.Collection, restaurant types.Restaurant) error {
	filter := bson.M{"place_id": restaurant.PlaceID}

	update := bson.M{
		"$set": restaurant,
	}

	opts := options.Update().SetUpsert(true)
	_, err := collection.UpdateOne(ctx, filter, update, opts)

	if err != nil {
		fmt.Printf("Error upserting restaurant %s: %v\n", restaurant.PlaceID, err)
		return err
	}

	return nil
}

func GetAllSavedRestaurants(ctx context.Context, collection *mongo.Collection) ([]types.Restaurant, error) {
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, fmt.Errorf("error finding saved restaurants: %w", err)
	}
	defer cursor.Close(ctx)

	var restaurants []types.Restaurant
	if err = cursor.All(ctx, &restaurants); err != nil {
		return nil, fmt.Errorf("error decoding saved restaurants: %w", err)
	}

	return restaurants, nil
}

func GetAllRestaurantsId(ctx context.Context, collection *mongo.Collection) ([]string, error) {
	cursor, err := collection.Find(ctx, bson.M{})

	if err != nil {
		return nil, fmt.Errorf("error finding restaurants: %w", err)
	}

	defer cursor.Close(ctx)

	var ids []string

	for cursor.Next(ctx) {
		var result struct {
			PlaceID string `bson:"placeid"`
		}
		if err := cursor.Decode(&result); err != nil {
			return nil, fmt.Errorf("error decoding restaurant: %w", err)
		}
		ids = append(ids, result.PlaceID)
	}

	if err := cursor.Err(); err != nil {
		return nil, fmt.Errorf("cursor error: %w", err)
	}

	return ids, nil
}

func CreateUniqueIndexOnPlaceID(ctx context.Context, collection *mongo.Collection) error {
	indexModel := mongo.IndexModel{
		Keys:    bson.D{{Key: "place_id", Value: 1}},
		Options: options.Index().SetUnique(true),
	}

	_, err := collection.Indexes().CreateOne(ctx, indexModel)
	if err != nil {
		return fmt.Errorf("error creating unique index on place_id: %w", err)
	}

	fmt.Println("Successfully created unique index on place_id field")
	return nil
}
