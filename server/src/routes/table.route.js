import express from 'express';
import {
    createTable,
    getTablesByRestaurant,
    updateTable,
    deleteTable,
} from "../controllers/table.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import {isStaff} from "../middleware/role.middleware.js";
import { check } from 'express-validator';


const tableRouter = express.Router();

//@access Public


// @route Get /api/tables
// @desc get all tables for a restaurant
tableRouter.get('/:restaurantId', getTablesByRestaurant);


//@access Private


// @route Post /api/tables
// @desc create a new table
tableRouter.post('/', authMiddleware, isStaff,[
    check('restaurant', 'Restaurant ID is required').notEmpty(),
    check('name', 'Table name is required').notEmpty(),
    check('capacity', 'Table capacity is required and must be a number').isInt({ min: 1 }),
], createTable);

// @route Put /api/tables/:id
// @desc update a table
tableRouter.put('/:id', authMiddleware, isStaff, updateTable);
// @route Delete /api/tables/:id
// @desc delete a table
tableRouter.delete('/:id', authMiddleware, isStaff, deleteTable);

export default tableRouter;

