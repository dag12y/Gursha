import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { isStaff } from "../middleware/role.middleware.js";
import {
    createReservation,
    getMyReservations,
    cancelReservation,
    getRestaurantReservations,
    updateReservationStatus,
} from "../controllers/reservation.controller.js";

const reservationRouter = express.Router();

//@access private, diner routes

reservationRouter.post("/", authMiddleware, createReservation);
reservationRouter.get("/my", authMiddleware, getMyReservations);
reservationRouter.put("/cancel/:id", authMiddleware, cancelReservation);

//@access private, staff routes

reservationRouter.get(
    "/restaurant/:restaurantId",
    authMiddleware,
    isStaff,
    getRestaurantReservations,
);
reservationRouter.put(
    "/status/:id",
    authMiddleware,
    isStaff,
    updateReservationStatus,
);

export default reservationRouter;
