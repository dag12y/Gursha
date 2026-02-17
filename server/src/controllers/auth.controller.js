import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export async function registerUser(req, res) {
    try {
        // 1. Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, role } = req.body;

        // 2. Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 3. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // 5. Response
        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Register error:", error);
        return res
            .status(500)
            .json({ message: "Server error", error: error.message });
    }
}

export async function loginUser(req, res) {
    try {
        // 1. Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // 2. Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 3. Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 4. Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        return res
            .status(200)
            .json({ message: "User logged in successfully", token });
    } catch (error) {
        console.error("Login error:", error);
        return res
            .status(500)
            .json({ message: "Server error", error: error.message });
    }
}

export async function getCurrentUser(req, res) {
    // req.user is set by authMiddleware
    const { userId } = req.user;

    // Get user info
    try {
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "Current user info", user });
    } catch (error) {
        console.error("Get current user error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

export async function getAllUsers(req, res) {
    try {
        const users = await User.find({ role: { $ne: "admin" } })
            .select("-password")
            .sort({ name: 1 })
            .populate("restaurant", "name");

        return res.status(200).json({
            message: "Users fetched successfully",
            users,
        });
    } catch (error) {
        console.error("Get users error:", error);
        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
}

export async function assignStaffRole(req, res) {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        //get restaurantId and userId from request
        const { restaurantId } = req.body;
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user
        user.role = "staff";
        user.restaurant = restaurantId;

        await user.save();

        return res.status(200).json({
            message: "User promoted to staff successfully",
            user,
        });
    } catch (error) {
        console.error("Error assigning staff role:", error);
        
        if(error.kind == "ObjectId"){
            return res.status(400).json({
                message:'Invalid Restaurant id.'
            })
        }
        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
}
