import Restaurant from "../models/Restaurant.js";
import Table from "../models/Table.js";
import Reservation from "../models/Reservation.js";
import { validationResult } from "express-validator";
import { ACTIVE_RESERVATION_STATUSES } from "../constants/reservation-status.js";

export async function getTablesByRestaurant(req, res) {
    // Get tables for a specific restaurant
    const { restaurantId } = req.params;
    try {
        // Check if the restaurant exists
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        // Get tables for the restaurant
        const tables = await Table.find({ restaurant: restaurantId })
            .populate("restaurant")
            .lean();
        if (!tables) {
            return res
                .status(404)
                .json({ error: "No tables found for this restaurant" });
        }

        // Derive live status from reservations so UI does not show reserved tables as available.
        const now = new Date();
        const reservations = await Reservation.find({
            restaurant: restaurantId,
            status: { $in: ACTIVE_RESERVATION_STATUSES },
            endTime: { $gt: now },
        }).select("table status startTime endTime");

        const reservationStateByTable = new Map();
        for (const reservation of reservations) {
            const tableId = reservation.table?.toString();
            if (!tableId) {
                continue;
            }

            const isCurrentlySeated =
                reservation.status === "Seated" &&
                reservation.startTime <= now &&
                reservation.endTime > now;

            const existing = reservationStateByTable.get(tableId);
            if (isCurrentlySeated || existing === "Occupied") {
                reservationStateByTable.set(tableId, "Occupied");
            } else {
                reservationStateByTable.set(tableId, "Reserved");
            }
        }

        const tablesWithEffectiveStatus = tables.map((table) => {
            const derived = reservationStateByTable.get(table._id.toString());
            if (!derived) {
                return table;
            }

            // Respect explicit floor states if staff intentionally set them.
            if (table.status === "Occupied" || table.status === "Finishing Up") {
                return table;
            }

            return {
                ...table,
                status: derived,
            };
        });
        return res.json({
            message: "Tables retrieved successfully",
            tables: tablesWithEffectiveStatus,
        });
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(400).json({ error: "Invalid restaurant ID" });
        }
        console.error(error.message);
        return res
            .status(500)
            .json({ error: "Internal server error", message: error.message });
    }
}

export async function createTable(req, res) {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, capacity } = req.body;
    const restaurantId = req.restaurantId;

    try {
        // Check if the restaurant exists
        const existingRestaurant = await Restaurant.findById(restaurantId);
        if (!existingRestaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        //prevent duplicate table names within the same restaurant
        const existingTable = await Table.findOne({ restaurant: restaurantId, name });
        if (existingTable) {
            return res.status(400).json({
                error: "A table with this name already exists in the restaurant",
            });
        }

        // Create the new table
        const table = await Table.create({
            restaurant: restaurantId,
            name,
            capacity,
        });

        return res
            .status(201)
            .json({ message: "Table created successfully", table });
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(400).json({ error: "Invalid restaurant ID" });
        }
        console.error(error.message);
        return res
            .status(500)
            .json({ error: "Internal server error", message: error.message });
    }
}

export async function updateTable(req, res) {
    const { id } = req.params;
    const restaurantId = req.restaurantId;
    try {
        // Extract the fields to update from the request body
        const { name, capacity, status } = req.body;

        //create an object to hold the fields to update, only include fields that are provided in the request body
        const updateData = {};
        if (name) updateData.name = name;
        if (capacity) updateData.capacity = capacity;
        if (status) updateData.status = status;

        const existingTable = await Table.findById(id);
        if (!existingTable) {
            return res.status(404).json({ error: "Table not found" });
        }

        if (existingTable.restaurant.toString() !== restaurantId.toString()) {
            return res.status(403).json({
                error: "Access denied: Table does not belong to your restaurant",
            });
        }

        //find the table by id and update it with the new data from the request body
        const table = await Table.findByIdAndUpdate(id, updateData, {
            returnDocument: "after",
        });

        return res.json({ message: "Table updated successfully", table });
    } catch (error) {
        console.error(error.message);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ error: "Invalid table ID" });
        }
        return res
            .status(500)
            .json({ error: "Internal server error", message: error.message });
    }
}

export async function deleteTable(req, res) {
    const { id } = req.params;
    const restaurantId = req.restaurantId;
    try {
        const table = await Table.findById(id);
        if (!table) {
            return res.status(404).json({ error: "Table not found" });
        }

        if (table.restaurant.toString() !== restaurantId.toString()) {
            return res.status(403).json({
                error: "Access denied: Table does not belong to your restaurant",
            });
        }

        //find the table by id and delete it from the database
        await table.deleteOne();
        return res.json({ message: "Table deleted successfully" });
    } catch (error) {
        console.error(error.message);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ error: "Invalid table ID" });
        }
        return res
            .status(500)
            .json({ error: "Internal server error", message: error.message });
    }
}
