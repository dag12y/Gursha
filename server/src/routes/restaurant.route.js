import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { isAdmin, isStaff } from "../middleware/role.middleware.js";
import upload from "../middleware/upload.middleware.js";
import {
    addMenuItem,
    createRestaurant,
    deleteMenuItem,
    getAllRestaurants,
    getMyRestaurantMenu,
    getRestaurantById,
    updateRestaurant,
    updateMenuItem,
    deleteRestaurant,
} from "../controllers/restaurant.controller.js";
import { check } from "express-validator";

const restaurantRouter = express.Router();

//@access Public

//@route Get api/restaurants/
//@desc Get all restaurants
restaurantRouter.get("/", getAllRestaurants);

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

//@route GET api/restaurants/menu/my
//@desc Get menu for assigned staff restaurant
restaurantRouter.get("/menu/my", authMiddleware, isStaff, getMyRestaurantMenu);

//@route POST api/restaurants/menu/my
//@desc Add menu item to assigned staff restaurant
restaurantRouter.post(
    "/menu/my",
    authMiddleware,
    isStaff,
    upload.single("imageFile"),
    [
        check("name", "Name is required").notEmpty(),
        check("price", "Price is required and must be a number").isFloat({
            min: 0,
        }),
        check("image", "Image must be a valid URL")
            .optional({ checkFalsy: true })
            .isURL(),
    ],
    addMenuItem,
);

//@route PUT api/restaurants/menu/my/:itemId
//@desc Update menu item for assigned staff restaurant
restaurantRouter.put(
    "/menu/my/:itemId",
    authMiddleware,
    isStaff,
    upload.single("imageFile"),
    [
        check("name", "Name must not be empty").optional().notEmpty(),
        check("price", "Price must be a number")
            .optional()
            .isFloat({ min: 0 }),
        check("image", "Image must be a valid URL")
            .optional({ checkFalsy: true })
            .isURL(),
    ],
    updateMenuItem,
);

//@route DELETE api/restaurants/menu/my/:itemId
//@desc Delete menu item for assigned staff restaurant
restaurantRouter.delete(
    "/menu/my/:itemId",
    authMiddleware,
    isStaff,
    deleteMenuItem,
);

//@route Get api/restaurants/:id
//@desc Get restaurant by id
restaurantRouter.get("/:id", getRestaurantById);


//@route PUT api/restaurants/:id
//@desc Update restaurant by id
restaurantRouter.put("/:id", authMiddleware, isAdmin, updateRestaurant);

//@route DELETE api/restaurants/:id
//@desc Delete restaurant by id
restaurantRouter.delete("/:id", authMiddleware, isAdmin, deleteRestaurant);

export default restaurantRouter;
