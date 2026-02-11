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
        // Handle invalid ObjectId
        if (error.kind === "ObjectId") {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        // Handle duplicate index error
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

export async function getMyReservations(req, res) {
    try {
        // Fetch reservations for the logged-in user and populate restaurant and table details
        const reservations = await Reservation.find({ user: req.user.userId }).populate("restaurant",'name').populate("table",'name capacity');

        //check if reservations exist
        if (!reservations || reservations.length === 0) {
            return res.status(404).json({ message: "No reservations found" });
        }

        return res.status(200).json({ reservations });
    } catch (error) {
        console.error("Error fetching reservations:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

export async function cancelReservation(req, res) {
    const reservationId = req.params.id;
    try {
        // Find the reservation by ID
        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        // Check if the user is the owner of the reservation
        if (reservation.user.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Update the reservation status to canceled
        reservation.status = "Cancelled";
        await reservation.save();

        return res.status(200).json({ message: "Reservation canceled successfully" });
    } catch (error) {
        console.error("Error canceling reservation:", error);
        // Handle invalid ObjectId
        if (error.kind === "ObjectId") {
            return res.status(400).json({ message: "Invalid reservation ID format" });
        }
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

export async function getRestaurantReservations(req, res) {
    const restaurantId = req.params.restaurantId;
    try {
        //find reservations for the restaurant
        const reservations = await Reservation.find({ restaurant: restaurantId }).populate("table",'name capacity').populate("user",'name email');
        
        //check if reservations exist
        if (!reservations || reservations.length === 0) {
            return res.status(404).json({ message: "No reservations found for this restaurant" });
        }

        return res.status(200).json({ message: "Reservations fetched successfully", reservations });

    } catch (error) {
        console.error("Error fetching restaurant reservations:", error);
        // Handle invalid ObjectId
        if (error.kind === "ObjectId") {
            return res.status(400).json({ message: "Invalid restaurant ID format" });
        }
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

export async function updateReservationStatus(req, res) {
    const reservationId = req.params.id;
    try {
        //validate request body 
        const errors = validationResult(req);   
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }   

        const { status } = req.body;

        //find reservation by ID
        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        //update reservation status
        reservation.status = status;
        await reservation.save();

        return res.status(200).json({ message: "Reservation status updated successfully" ,reservation});
    } catch (error) {
        console.error("Error updating reservation status:", error);
        // Handle invalid ObjectId
        if (error.kind === "ObjectId") {
            return res.status(400).json({ message: "Invalid reservation ID format" });
        }
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}
