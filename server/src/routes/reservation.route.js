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
import { check } from "express-validator";

const reservationRouter = express.Router();

//@access private, diner routes

//@route Post api/reservations
//@desc Create a new reservation
reservationRouter.post("/", authMiddleware, [
    check('restaurant', 'Restaurant ID is required').not().isEmpty(),
    check('table', 'Table ID is required').not().isEmpty(),
    check('date', 'Reservation date is required').not().isEmpty(),
    check('time', 'Reservation time is required').not().isEmpty(),
    check('partySize', 'Party size is required and must be a number').isInt({ min: 1 }),
],createReservation);

//@route Get api/reservations/my
//@desc Get my reservations
reservationRouter.get("/my", authMiddleware, getMyReservations);


//@route Put api/reservations/cancel/:id    
//@desc Cancel a reservation
reservationRouter.put("/cancel/:id", authMiddleware, cancelReservation);



//@access private, staff routes


//@route Get api/reservations/restaurant/:restaurantId
//@desc Get reservations for a restaurant
reservationRouter.get(
    "/restaurant/:restaurantId",
    authMiddleware,
    isStaff,
    getRestaurantReservations,
);

//@route Put api/reservations/status/:id
//@desc Update reservation status
reservationRouter.put(
    "/status/:id",
    authMiddleware,
    isStaff,
    [check('status', 'Status is required and must be one of Pending, Confirmed, Seated, Completed, Cancelled').isIn(['Pending', 'Confirmed', 'Seated', 'Completed', 'Cancelled'])],
    updateReservationStatus,
);

export default reservationRouter;
