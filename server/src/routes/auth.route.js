import express from "express";
import { check } from "express-validator";
import authMiddleware from "../middleware/auth.middleware.js";
import {
    registerUser,
    loginUser,
    getCurrentUser,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();


//@router POST /api/auth/register
//@desc Register a new user
//@access Public
authRouter.post(
    "/register",
    [
        check("name", "Name is required").not().isEmpty(),
        check("email", "Please include a valid email").isEmail(),
        check("password", "Password is required")
            .exists()
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long"),
    ],
    registerUser,
);

//@router POST /api/auth/login
//@desc Login user
//@access Public
authRouter.post(
    "/login",
    [
        check("email", "Please include a valid email").isEmail(),
        check("password", "Password is required").exists(),
    ],
    loginUser,
);

//@router GET /api/auth/me
//@desc Get current user
//@access Private
authRouter.get("/me", authMiddleware, getCurrentUser);

export default authRouter;
