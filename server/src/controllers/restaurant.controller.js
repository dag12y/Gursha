import Restaurant from '../models/Restaurant.js';
import { validationResult } from 'express-validator';
import cloudinary from "../config/cloudinary.js";

function uploadBufferToCloudinary(buffer, folder) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            },
        );
        stream.end(buffer);
    });
}

export async function getAllRestaurants(req, res) {
    try {
        const page = Math.max(Number.parseInt(req.query.page || "1", 10), 1);
        const limit = Math.min(
            Math.max(Number.parseInt(req.query.limit || "12", 10), 1),
            100,
        );
        const skip = (page - 1) * limit;

        const query = {};
        const search = (req.query.search || "").trim();
        const cuisine = (req.query.cuisine || "").trim();
        const location = (req.query.location || "").trim();
        const priceRange = (req.query.priceRange || "").trim();

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { cuisine: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
            ];
        }
        if (cuisine) {
            query.cuisine = { $regex: cuisine, $options: "i" };
        }
        if (location) {
            query.location = { $regex: location, $options: "i" };
        }
        if (priceRange) {
            query.priceRange = priceRange;
        }

        const [restaurants, total] = await Promise.all([
            Restaurant.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Restaurant.countDocuments(query),
        ]);

        const totalPages = Math.max(Math.ceil(total / limit), 1);

        return res.status(200).json({
            data: restaurants,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });
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

export async function getMyRestaurantMenu(req, res) {
    const restaurantId = req.restaurantId;
    try {
        const restaurant = await Restaurant.findById(restaurantId).select(
            "name menu",
        );
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        return res.status(200).json({
            restaurantId: restaurant._id,
            restaurantName: restaurant.name,
            menu: restaurant.menu || [],
        });
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(400).json({ message: "Invalid restaurant ID" });
        }
        return res.status(500).json({
            message: "Error fetching menu",
            error: error.message,
        });
    }
}

export async function addMenuItem(req, res) {
    const restaurantId = req.restaurantId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, price, description, image } = req.body;
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        let imageUrl = image;
        if (req.file) {
            const uploadResult = await uploadBufferToCloudinary(
                req.file.buffer,
                "gursha/menu",
            );
            imageUrl = uploadResult.secure_url;
        }

        restaurant.menu.push({
            name,
            price: Number(price),
            description,
            image: imageUrl,
        });
        await restaurant.save();

        return res.status(201).json({
            message: "Menu item added successfully",
            menu: restaurant.menu,
            item: restaurant.menu[restaurant.menu.length - 1],
        });
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(400).json({ message: "Invalid restaurant ID" });
        }
        return res.status(500).json({
            message: "Error adding menu item",
            error: error.message,
        });
    }
}

export async function updateMenuItem(req, res) {
    const restaurantId = req.restaurantId;
    const { itemId } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, price, description, image } = req.body;
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        const item = restaurant.menu.id(itemId);
        if (!item) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        let imageUrl = image;
        if (req.file) {
            const uploadResult = await uploadBufferToCloudinary(
                req.file.buffer,
                "gursha/menu",
            );
            imageUrl = uploadResult.secure_url;
        }

        if (name !== undefined) item.name = name;
        if (price !== undefined) item.price = Number(price);
        if (description !== undefined) item.description = description;
        if (imageUrl !== undefined) item.image = imageUrl;

        await restaurant.save();

        return res.status(200).json({
            message: "Menu item updated successfully",
            menu: restaurant.menu,
            item,
        });
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        return res.status(500).json({
            message: "Error updating menu item",
            error: error.message,
        });
    }
}

export async function deleteMenuItem(req, res) {
    const restaurantId = req.restaurantId;
    const { itemId } = req.params;

    try {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        const item = restaurant.menu.id(itemId);
        if (!item) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        item.deleteOne();
        await restaurant.save();

        return res.status(200).json({
            message: "Menu item deleted successfully",
            menu: restaurant.menu,
        });
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        return res.status(500).json({
            message: "Error deleting menu item",
            error: error.message,
        });
    }
}

export async function createRestaurant(req, res) {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Destructure body
    const { name, location, cuisine, priceRange, hours, menu, photos } =
        req.body;

    try {
        // Create restaurant
        const restaurant = await Restaurant.create({
            name,
            location,
            cuisine,
            priceRange,
            hours,
            menu,
            photos,
            // tables and staff can be empty initially
        });

        // Return created restaurant
        return res.status(201).json({
            message: "Restaurant created successfully",
            restaurant,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

export async function updateRestaurant(req, res) {
    //destructure body
    const { id } = req.params;
    const {
        name,
        location,
        cuisine,
        priceRange,
        hours,
        menu,
        photos,
        tables,
        staff,
    } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (name) updateData.name = name;
    if (location) updateData.location = location;
    if (cuisine) updateData.cuisine = cuisine;
    if (priceRange) updateData.priceRange = priceRange;
    if (hours) updateData.hours = hours;
    if (menu !== undefined) updateData.menu = menu;
    if (photos !== undefined) updateData.photos = photos;
    if (tables !== undefined) updateData.tables = tables;
    if (staff !== undefined) updateData.staff = staff;

    try {
        //find restaurant by id and update the data
        const restaurant = await Restaurant.findByIdAndUpdate(id, updateData, {
            returnDocument: 'after', // Return the updated document
        });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        return res.status(200).json({
            message: `Restaurant with id ${id} updated successfully`,
            restaurant,
        });
    } catch (error) {
        if(error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid restaurant ID' });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" ,error:error.message});
    }
}

export async function deleteRestaurant(req, res) {
    const {id} = req.params;
    try {
        //find restaurant by id and delete it
        const restaurant = await Restaurant.findByIdAndDelete(id);
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
    } catch (error) {
        if (error.kind === 'ObjectId') { 
            return res.status(400).json({ message: 'Invalid restaurant ID' });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
    return res.status(200).json({message: `Restaurant with id ${id} deleted successfully`});
}
