import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import {isAdmin} from '../middleware/role.middleware.js';
import { createRestaurant, getAllRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant } from '../controllers/restaurant.controller.js';


const restaurantRouter = express.Router();

//@access Public
restaurantRouter.get('/', getAllRestaurants);
restaurantRouter.get('/:id', getRestaurantById);

//@access Private
restaurantRouter.post('/', authMiddleware, isAdmin, createRestaurant);
restaurantRouter.put('/:id', authMiddleware, isAdmin, updateRestaurant);
restaurantRouter.delete('/:id', authMiddleware, isAdmin, deleteRestaurant);

export default restaurantRouter;