import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

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
        return res.status(500).json({ message: "Server error", error: error.message });
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
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 3. Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 4. Generate token (not implemented here)
        return res.status(200).json({ message: "User logged in successfully" });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
        
    }
}

export function getCurrentUser(req, res) {
    // Logic to get current user info here
    return res.status(200).json({ message: "Current user info" });
}
