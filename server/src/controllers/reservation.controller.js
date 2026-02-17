import Reservation from "../models/Reservation.js";
import Restaurant from "../models/Restaurant.js";
import Table from "../models/Table.js";
import { validationResult } from "express-validator";

function buildStatusHistoryEntry(status, changedBy, note) {
    return {
        status,
        changedBy,
        changedAt: new Date(),
        note,
    };
}

function generateTimeSlots(intervalMinutes = 30) {
    const slots = [];
    for (let hour = 11; hour <= 21; hour += 1) {
        for (let minute = 0; minute < 60; minute += intervalMinutes) {
            const hh = String(hour).padStart(2, "0");
            const mm = String(minute).padStart(2, "0");
            slots.push(`${hh}:${mm}`);
        }
    }
    return slots;
}

export async function getAvailableTimeSlots(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { restaurant, date, partySize } = req.query;
    const normalizedPartySize = Number(partySize);

    try {
        const restaurantExists = await Restaurant.findById(restaurant);
        if (!restaurantExists) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        const candidateTables = await Table.find({
            restaurant,
            capacity: { $gte: normalizedPartySize },
        }).select("_id");

        if (candidateTables.length === 0) {
            return res.status(200).json({ slots: [] });
        }

        const startOfDay = new Date(`${date}T00:00:00`);
        const endOfDay = new Date(`${date}T23:59:59`);

        const activeReservations = await Reservation.find({
            restaurant,
            status: { $in: ["Pending", "Confirmed", "Seated"] },
            startTime: { $lt: endOfDay },
            endTime: { $gt: startOfDay },
        }).select("table startTime endTime");

        const candidateTableIds = candidateTables.map((table) => table._id.toString());

        const slots = generateTimeSlots(30)
            .map((time) => {
                const slotStart = new Date(`${date}T${time}:00`);
                const slotEnd = new Date(slotStart.getTime() + 2 * 60 * 60 * 1000);

                const reservedForSlot = activeReservations
                    .filter(
                        (reservation) =>
                            reservation.startTime < slotEnd &&
                            reservation.endTime > slotStart,
                    )
                    .map((reservation) => reservation.table.toString());

                const availableCount = candidateTableIds.filter(
                    (tableId) => !reservedForSlot.includes(tableId),
                ).length;

                return {
                    time,
                    available: availableCount > 0,
                    availableTables: availableCount,
                };
            })
            .filter((slot) => slot.available);

        return res.status(200).json({ slots });
    } catch (error) {
        console.error("Error fetching availability:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
}

export async function createReservation(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { restaurant, date, time, partySize } = req.body;

        // Combine date + time
        const startTime = new Date(`${date}T${time}:00`);

        // Add 2 hours
        const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);


        // Check restaurant exists
        const restaurantExists = await Restaurant.findById(restaurant);
        if (!restaurantExists) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        // Find tables that can accommodate party size
        const candidateTables = await Table.find({
            restaurant,
            capacity: { $gte: partySize },
        }).sort({ capacity: 1 });

        if (candidateTables.length === 0) {
            return res.status(400).json({
                message: "No tables available for this party size",
            });
        }

        // Find reserved tables at that date/time
        const reservedTables = await Reservation.find({
            restaurant,
            status: { $in: ["Pending", "Confirmed", "Seated"] },
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
        }).select("table");


        const reservedTableIds = reservedTables.map((r) => r.table.toString());

        // Find first available table
        const availableTable = candidateTables.find(
            (table) => !reservedTableIds.includes(table._id.toString()),
        );

        if (!availableTable) {
            return res.status(400).json({
                message: "No available tables for selected time",
            });
        }

        // Create reservation using AUTO selected table and Handle time conflict
        const reservation = await Reservation.create({
            restaurant,
            table: availableTable._id,
            startTime,
            endTime,
            partySize,
            user: req.user.userId,
            statusHistory: [
                buildStatusHistoryEntry(
                    "Pending",
                    req.user.userId,
                    "Reservation created",
                ),
            ],
        });


        return res.status(201).json({
            message: "Reservation created successfully",
            reservation,
        });
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

        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
}


export async function getMyReservations(req, res) {
    try {
        // Fetch reservations for the logged-in user and populate restaurant and table details
        const reservations = await Reservation.find({ user: req.user.userId })
            .populate("restaurant", "name")
            .populate("table", "name capacity")
            .populate("statusHistory.changedBy", "name email role");

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
        reservation.statusHistory.push(
            buildStatusHistoryEntry(
                "Cancelled",
                req.user.userId,
                "Reservation cancelled by diner",
            ),
        );
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
    const restaurantId = req.restaurantId;
    try {
        //find reservations for the restaurant
        const reservations = await Reservation.find({ restaurant: restaurantId })
            .populate("table", "name capacity")
            .populate("user", "name email")
            .populate("statusHistory.changedBy", "name email role");
        
        //check if reservations exist
        if (!reservations || reservations.length === 0) {
            return res.status(404).json({ message: "No reservations found for this restaurant" });
        }

        return res.status(200).json({ message: "Reservations fetched successfully", reservations });

    } catch (error) {
        console.error("Error fetching restaurant reservations:", error);
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
        reservation.statusHistory.push(
            buildStatusHistoryEntry(
                status,
                req.user.userId,
                "Reservation status updated by staff",
            ),
        );
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

export async function getDashboardAnalytics(req, res) {
    const restaurantId = req.restaurantId;

    try {
        // Total reservations (all time)
        const totalReservations = await Reservation.countDocuments({
            restaurant: restaurantId,
        });

        // Reservations last 7 days
        const reservationsByDate = await Reservation.aggregate([
            {
                $match: {
                    restaurant: restaurantId,
                    startTime: {
                        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$startTime",
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Today's reservations (UTC safe version)
        const startOfToday = new Date();
        startOfToday.setUTCHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setUTCHours(23, 59, 59, 999);

        const todayReservations = await Reservation.countDocuments({
            restaurant: restaurantId,
            startTime: { $gte: startOfToday, $lte: endOfToday },
        });

        // Reservations by status
        const reservationsByStatus = await Reservation.aggregate([
            { $match: { restaurant: restaurantId } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        // Most booked tables (top 5)
        const mostBookedTables = await Reservation.aggregate([
            { $match: { restaurant: restaurantId } },
            {
                $group: {
                    _id: "$table",
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "tables",
                    localField: "_id",
                    foreignField: "_id",
                    as: "tableDetails",
                },
            },
            { $unwind: "$tableDetails" },
            {
                $project: {
                    _id: 0,
                    tableId: "$_id",
                    tableName: "$tableDetails.name",
                    count: 1,
                },
            },
        ]);

        res.status(200).json({
            totalReservations,
            todayReservations,
            reservationsByDate,
            reservationsByStatus,
            mostBookedTables,
        });
    } catch (error) {
        console.error("Error fetching dashboard analytics:", error);
        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
}
