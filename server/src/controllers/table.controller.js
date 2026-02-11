import Restaurant from '../models/Restaurant.js';
import Table from '../models/Table.js';
import { validationResult } from 'express-validator';

export async function getTablesByRestaurant(req, res) {
    // Get tables for a specific restaurant
    const { restaurantId } = req.params;
    try {
        // Check if the restaurant exists
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        // Get tables for the restaurant
        const tables = await Table.find({ restaurant: restaurantId }).populate('restaurant');
        if (!tables) {
            return res.status(404).json({ error: 'No tables found for this restaurant' });
        }
        return res.json({ message: 'Tables retrieved successfully', tables });

    } catch (error) {
        if(error.kind === 'ObjectId') {
            return res.status(400).json({ error: 'Invalid restaurant ID' });
        }
        console.error(error.message);
        return res.status(500).json({ error: 'Internal server error' ,message:error.message
        });
        
        
    }
}

export async function createTable(req, res) {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { restaurant, name, capacity } = req.body;

    try {
        // Check if the restaurant exists
        const existingRestaurant = await Restaurant.findById(restaurant);
        if (!existingRestaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        //prevent duplicate table names within the same restaurant
        const existingTable = await Table.findOne({ restaurant, name });
        if (existingTable) {
            return res.status(400).json({ error: 'A table with this name already exists in the restaurant' });
        }


        // Create the new table
        const table = await Table.create({ restaurant, name, capacity });

        return res.status(201).json({ message: 'Table created successfully', table });
    } catch (error) {
        if(error.kind === 'ObjectId') {
            return res.status(400).json({ error: 'Invalid restaurant ID' });
        }
        console.error(error.message);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}

export function updateTable(req, res) {
    const { id } = req.params;
    res.send(`Update table with id ${id}`);
}

export function deleteTable(req, res) {
    const { id } = req.params;
    res.send(`Delete table with id ${id}`);
}