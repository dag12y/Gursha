import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import restaurantRouter from "./routes/restaurant.route.js";
import tableRouter from "./routes/table.route.js";
import reservationRouter from "./routes/reservation.route.js";

function getCorsOptions() {
    const explicitOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(",")
              .map((origin) => origin.trim())
              .filter(Boolean)
        : [];

    if (explicitOrigins.length > 0) {
        return { origin: explicitOrigins };
    }

    if (process.env.FRONTEND_BASE_URL) {
        return { origin: process.env.FRONTEND_BASE_URL };
    }

    return {};
}

const app = express();

app.use(cors(getCorsOptions()));
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/restaurants", restaurantRouter);
app.use("/api/tables", tableRouter);
app.use("/api/reservations", reservationRouter);

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.get("/health", (req, res) => {
    res.status(200).json({ ok: true });
});

export default app;
