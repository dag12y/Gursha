import mongoose from "mongoose";
import { RESERVATION_STATUSES } from "../constants/reservation-status.js";

const reservationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true,
        },
        table: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Table",
            required: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        partySize: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: RESERVATION_STATUSES,
            default: "Pending",
        },
        statusHistory: [
            {
                status: {
                    type: String,
                    enum: RESERVATION_STATUSES,
                    required: true,
                },
                changedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                changedAt: {
                    type: Date,
                    default: Date.now,
                },
                note: {
                    type: String,
                },
            },
        ],
    },
    { timestamps: true },
);

const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation;
