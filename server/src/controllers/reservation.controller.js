import Reservation from "../models/Reservation.js";
import Restaurant from "../models/Restaurant.js";
import Table from "../models/Table.js";
import { validationResult } from "express-validator";

export async function createReservation(req, res) {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { restaurant, table, date, time, partySize } = req.body;

        //check if restaurant exists
        const restaurantExists = await Restaurant.findById(restaurant);
        if (!restaurantExists) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        //check if table exists
        const tableExists = await Table.findById(table);
        if (!tableExists) {
            return res.status(404).json({ message: "Table not found" });
        }

        //check if table belongs to the restaurant
        if (tableExists.restaurant.toString() !== restaurant) {
            return res
                .status(400)
                .json({ message: "Table does not belong to the restaurant" });
        }

        //check capacity
        if (tableExists.capacity < partySize) {
            return res
                .status(400)
                .json({ message: "Table capacity is less than party size" });
        }

        //check availability
        const existingReservation = await Reservation.findOne({
            table,
            date,
            time,
            status: { $in: ["pending", "confirmed", "seated"] },
        });

        if (existingReservation) {
            return res.status(400).json({
                message:
                    "Table is already reserved for the selected date and time",
            });
        }

        //create reservation
        const reservation = await Reservation.create({
            restaurant,
            table,
            date,
            time,
            partySize,
            user: req.user.userId,
        });

        return res
            .status(201)
            .json({ message: "Reservation created successfully", reservation });
    } catch (error) {
        console.error("Error creating reservation:", error);
        //handle duplicate index error
        if (error.code === 11000) {
            return res.status(400).json({
                message:
                    "Table is already reserved for the selected date and time",
            });
        }
        return res
            .status(500)
            .json({ message: "Server error", error: error.message });
    }
}

export function getMyReservations(req, res) {
    return res.status(200).json({ message: "List of my reservations" });
}

export function cancelReservation(req, res) {
    return res
        .status(200)
        .json({ message: "Reservation cancelled successfully" });
}

export function getRestaurantReservations(req, res) {
    return res
        .status(200)
        .json({ message: "List of reservations for the restaurant" });
}

export function updateReservationStatus(req, res) {
    return res
        .status(200)
        .json({ message: "Reservation status updated successfully" });
}
