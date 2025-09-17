import { Doc, Id } from "../convex/_generated/dataModel";
import { Restaurant } from "./restaurants";

export type SavedRestaurant = Doc<"savedRestaurants">;
export type Note = Doc<"notes">;

export type SaveRestaurantInput = Restaurant;
export type NoteId = Id<"notes">;
export type RestaurantId = Id<"savedRestaurants">;