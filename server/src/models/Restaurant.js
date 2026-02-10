import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        cuisine: {
            type: String,
            required: true,
        },
        priceRange: {
            type: String,
        },
        hours: {
            type: String,
        }, // e.g., 10:00 AM - 10:00 PM
        menu: [
            {
                name: String,
                price: Number,
                description: String,
            },
        ],
        photos: [String],
        tables: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Table",
            },
        ],
        staff: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true },
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
