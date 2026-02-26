import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Restaurant from "../src/models/Restaurant.js";
import Table from "../src/models/Table.js";
import Reservation from "../src/models/Reservation.js";

let mongoServer;
let usingExternalMongo = false;

if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = "test-jwt-secret";
}

async function cleanupDb() {
    await Promise.all([
        Reservation.deleteMany({}),
        Table.deleteMany({}),
        Restaurant.deleteMany({}),
        User.deleteMany({}),
    ]);
}

test.before(async () => {
    try {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
        return;
    } catch (error) {
        const fallbackUri = process.env.TEST_MONGO_URI;
        if (!fallbackUri) {
            throw new Error(
                "MongoMemoryServer download failed and TEST_MONGO_URI is not set. Refusing to use MONGO_URI to avoid wiping non-test data.",
            );
        }

        console.warn(
            `MongoMemoryServer unavailable (${error.code || "unknown"}). Falling back to ${fallbackUri}`,
        );

        await mongoose.connect(fallbackUri);
        usingExternalMongo = true;
    }
});

test.after(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});

test.beforeEach(async () => {
    if (usingExternalMongo && mongoose.connection.readyState !== 1) {
        throw new Error(
            "External MongoDB fallback is not connected. Set TEST_MONGO_URI or start local MongoDB.",
        );
    }
    await cleanupDb();
});

test("auth flow: register -> login -> get current user", async () => {
    const email = "auth-test@gursha.dev";
    const password = "password123";

    const registerRes = await request(app).post("/api/auth/register").send({
        name: "Auth Tester",
        email,
        password,
    });
    assert.equal(registerRes.status, 201);

    const user = await User.findOne({ email });
    assert.ok(user);

    const loginRes = await request(app).post("/api/auth/login").send({
        email,
        password,
    });
    assert.equal(loginRes.status, 200);
    assert.ok(loginRes.body.token);

    const meRes = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${loginRes.body.token}`);
    assert.equal(meRes.status, 200);
    assert.equal(meRes.body.user.email, email);
});

test("reservation flow: diner creates and cancels reservation", async () => {
    const email = "diner-flow@gursha.dev";
    const password = "password123";

    await request(app).post("/api/auth/register").send({
        name: "Diner Flow",
        email,
        password,
    });

    const loginRes = await request(app).post("/api/auth/login").send({
        email,
        password,
    });
    const token = loginRes.body.token;
    assert.ok(token);

    const restaurant = await Restaurant.create({
        name: "Test House",
        location: "Test City",
        cuisine: "Fusion",
        priceRange: "$$",
        hours: "11:00 AM - 10:00 PM",
    });

    await Table.create({
        restaurant: restaurant._id,
        name: "T1",
        capacity: 4,
        status: "Available",
    });

    const now = new Date();
    now.setDate(now.getDate() + 1);
    const date = now.toISOString().split("T")[0];

    const createRes = await request(app)
        .post("/api/reservations")
        .set("Authorization", `Bearer ${token}`)
        .send({
            restaurant: restaurant._id.toString(),
            date,
            time: "18:30",
            partySize: 2,
        });

    assert.equal(createRes.status, 201);
    assert.ok(createRes.body.reservation?._id);

    const reservationId = createRes.body.reservation._id;

    const cancelRes = await request(app)
        .put(`/api/reservations/cancel/${reservationId}`)
        .set("Authorization", `Bearer ${token}`);

    assert.equal(cancelRes.status, 200);

    const savedReservation = await Reservation.findById(reservationId);
    assert.equal(savedReservation.status, "Cancelled");
});
