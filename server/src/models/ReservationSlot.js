import mongoose from "mongoose";

const reservationSlotSchema = new mongoose.Schema(
    {
        reservation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reservation",
            required: true,
            index: true,
        },
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true,
            index: true,
        },
        table: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Table",
            required: true,
            index: true,
        },
        slotTime: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true },
);

// Prevent double booking on the same table+time slot.
reservationSlotSchema.index({ table: 1, slotTime: 1 }, { unique: true });

const ReservationSlot = mongoose.model("ReservationSlot", reservationSlotSchema);
export default ReservationSlot;
