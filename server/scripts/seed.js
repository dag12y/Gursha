import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "../src/config/db.js";
import User from "../src/models/User.js";
import Restaurant from "../src/models/Restaurant.js";
import Table from "../src/models/Table.js";
import Reservation from "../src/models/Reservation.js";
import ReservationSlot from "../src/models/ReservationSlot.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/Gursha";

function daysFromNow(days, hour, minute = 0) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(hour, minute, 0, 0);
    return date;
}

function buildReservationSlots(startTime, endTime, intervalMinutes = 30) {
    const slots = [];
    const intervalMs = intervalMinutes * 60 * 1000;
    for (let cursor = startTime.getTime(); cursor < endTime.getTime(); cursor += intervalMs) {
        slots.push(new Date(cursor));
    }
    return slots;
}

async function seed() {
    await connectDB(MONGO_URI);

    await Promise.all([
        ReservationSlot.deleteMany({}),
        Reservation.deleteMany({}),
        Table.deleteMany({}),
        Restaurant.deleteMany({}),
        User.deleteMany({}),
    ]);

    const hashed = await bcrypt.hash("password123", 10);

    const [admin, diner, staff] = await User.create([
        {
            name: "Platform Admin",
            email: "admin@gursha.dev",
            password: hashed,
            role: "admin",
        },
        {
            name: "Demo Diner",
            email: "diner@gursha.dev",
            password: hashed,
            role: "diner",
        },
        {
            name: "Demo Staff",
            email: "staff@gursha.dev",
            password: hashed,
            role: "staff",
        },
    ]);

    const [restaurantA, restaurantB] = await Restaurant.create([
        {
            name: "Blue Nile Kitchen",
            location: "Addis Ababa",
            cuisine: "Ethiopian",
            priceRange: "$$",
            hours: "11:00 AM - 11:00 PM",
            photos: [
                "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
            ],
            menu: [
                { name: "Doro Wat", price: 15.99, description: "Spicy chicken stew" },
                { name: "Tibs", price: 18.5, description: "Sauteed beef cubes" },
            ],
            staff: [staff._id],
        },
        {
            name: "Roma Trattoria",
            location: "Bole",
            cuisine: "Italian",
            priceRange: "$$$",
            hours: "12:00 PM - 10:30 PM",
            photos: [
                "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
            ],
            menu: [
                { name: "Margherita Pizza", price: 14.0, description: "Fresh basil, mozzarella" },
                { name: "Carbonara", price: 16.75, description: "Creamy pasta with pancetta" },
            ],
            staff: [],
        },
    ]);

    staff.restaurant = restaurantA._id;
    await staff.save();

    const tables = await Table.create([
        { restaurant: restaurantA._id, name: "A1", capacity: 2, status: "Available" },
        { restaurant: restaurantA._id, name: "A2", capacity: 4, status: "Available" },
        { restaurant: restaurantA._id, name: "A3", capacity: 6, status: "Available" },
        { restaurant: restaurantB._id, name: "B1", capacity: 2, status: "Available" },
        { restaurant: restaurantB._id, name: "B2", capacity: 4, status: "Available" },
    ]);

    const tableA2 = tables.find((table) => table.name === "A2");
    const tableA3 = tables.find((table) => table.name === "A3");

    const reservations = await Reservation.create([
        {
            user: diner._id,
            restaurant: restaurantA._id,
            table: tableA2._id,
            startTime: daysFromNow(1, 19, 0),
            endTime: daysFromNow(1, 21, 0),
            partySize: 4,
            status: "Confirmed",
            statusHistory: [{ status: "Pending", changedBy: diner._id, note: "Created" }],
        },
        {
            user: diner._id,
            restaurant: restaurantA._id,
            table: tableA3._id,
            startTime: daysFromNow(3, 20, 0),
            endTime: daysFromNow(3, 22, 0),
            partySize: 5,
            status: "Pending",
            statusHistory: [{ status: "Pending", changedBy: diner._id, note: "Created" }],
        },
    ]);

    const slotDocs = reservations.flatMap((reservation) =>
        buildReservationSlots(reservation.startTime, reservation.endTime).map(
            (slotTime) => ({
                reservation: reservation._id,
                restaurant: reservation.restaurant,
                table: reservation.table,
                slotTime,
            }),
        ),
    );
    await ReservationSlot.insertMany(slotDocs);

    console.log("Seed complete.");
    console.log("Admin: admin@gursha.dev / password123");
    console.log("Diner: diner@gursha.dev / password123");
    console.log("Staff: staff@gursha.dev / password123");
}

seed()
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.connection.close();
    });
