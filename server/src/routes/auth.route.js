import express from "express";
import { check } from "express-validator";
import authMiddleware from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/role.middleware.js";
import {
    registerUser,
    loginUser,
    verifyEmail,
    resendVerificationEmail,
    getCurrentUser,
    getAllUsers,
    assignStaffRole,
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

//@router POST /api/auth/verify-email
//@desc Verify user email
//@access Public
authRouter.post(
    "/verify-email",
    [
        check("email", "Please include a valid email").isEmail(),
        check("token", "Verification token is required").not().isEmpty(),
    ],
    verifyEmail,
);

//@router POST /api/auth/resend-verification
//@desc Resend verification email
//@access Public
authRouter.post(
    "/resend-verification",
    [check("email", "Please include a valid email").isEmail()],
    resendVerificationEmail,
);

//@router GET /api/auth/me
//@desc get current user
//@access Private
authRouter.get("/me", authMiddleware, getCurrentUser);

//@route GET /api/auth/users
//@desc get all non-admin users
//@access Private (admin)
authRouter.get("/users", authMiddleware, isAdmin, getAllUsers);

//@route Put /api/auth/assign-staff/:userId
//@desc assign staff role to user
//@access Private
authRouter.put('/assign-staff/:userId', authMiddleware, isAdmin, assignStaffRole);

export default authRouter;
