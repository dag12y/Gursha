import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
    {
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true,
        },
        name: {
            type: String,
            required: true,
        }, // e.g., "Table 1"
        capacity: {
            type: Number,
            required: true,
        }, // number of seats
        status: {
            type: String,
            enum: ["Available", "Reserved", "Occupied", "Finishing Up"],
            default: "Available",
        },
    },
    { timestamps: true },
);

const Table = mongoose.model("Table", tableSchema);
export default Table;
