import Restaurant from '../models/Restaurant.js';

export async function getAllRestaurants(req, res) {
    try {
        //find all restaurants
        const restaurants = await Restaurant.find();
        return res.status(200).json({ data: restaurants});
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching restaurants', error:error.message });
    }
}

export async function getRestaurantById(req, res) {
    const {id} = req.params;
    try {
        // find restaurant by id
        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        return res.status(200).json({ data: restaurant });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid restaurant ID' });
        }
        return res.status(500).json({ message: 'Error fetching restaurant', error:error.message });
    }
}

export function createRestaurant(req, res) {
    return res.status(201).json({message: 'Restaurant created successfully'});
}

export function updateRestaurant(req, res) {
    const {id} = req.params;
    return res.status(200).json({message: `Restaurant with id ${id} updated successfully`});
}

export function deleteRestaurant(req, res) {
    const {id} = req.params;
    return res.status(200).json({message: `Restaurant with id ${id} deleted successfully`});
}