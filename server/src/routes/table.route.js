import express from 'express';
import {
    createTable,
    getTablesByRestaurant,
    updateTable,
    deleteTable,
} from "../controllers/table.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import {isStaff} from "../middleware/role.middleware.js";

const tableRouter = express.Router();

//@access Public


// @route Get /api/tables
// @desc get all tables for a restaurant
tableRouter.get('/:restaurantId', getTablesByRestaurant);


//@access Private


// @route Post /api/tables
// @desc create a new table
tableRouter.post('/', authMiddleware, isStaff, createTable);

// @route Put /api/tables/:id
// @desc update a table
tableRouter.put('/:id', authMiddleware, isStaff, updateTable);
// @route Delete /api/tables/:id
// @desc delete a table
tableRouter.delete('/:id', authMiddleware, isStaff, deleteTable);

export default tableRouter;

