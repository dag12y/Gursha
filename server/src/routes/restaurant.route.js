import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/role.middleware.js";
import {
    createRestaurant,
    getAllRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
} from "../controllers/restaurant.controller.js";
import { check } from "express-validator";

const restaurantRouter = express.Router();

//@access Public

//@route Get api/restaurants/
//@desc Get all restaurants
restaurantRouter.get("/", getAllRestaurants);

//@route Get api/restaurants/:id
//@desc Get restaurant by id
restaurantRouter.get("/:id", getRestaurantById);

//@access Private

// @route POST api/restaurants/
// @desc Create a new restaurant
restaurantRouter.post(
    "/",
    authMiddleware,
    isAdmin,
    [
        check("name", "Name is required").notEmpty(),
        check("location", "Location is required").notEmpty(),
        check("cuisine", "Cuisine is required").notEmpty(),
    ],
    createRestaurant,
);


//@route PUT api/restaurants/:id
//@desc Update restaurant by id
restaurantRouter.put("/:id", authMiddleware, isAdmin, updateRestaurant);

//@route DELETE api/restaurants/:id
//@desc Delete restaurant by id
restaurantRouter.delete("/:id", authMiddleware, isAdmin, deleteRestaurant);

export default restaurantRouter;
