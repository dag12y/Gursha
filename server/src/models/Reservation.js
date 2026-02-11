import mongoose from "mongoose";

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
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        partySize: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Confirmed", "Declined", "Seated", "Cancelled"],
            default: "Pending",
        },
    },
    { timestamps: true },
);

// Prevent double booking of same table at same date/time
reservationSchema.index({ table: 1, date: 1, time: 1 }, { unique: true });

const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation;
