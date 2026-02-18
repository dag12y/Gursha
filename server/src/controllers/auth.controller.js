import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { buildVerificationEmailHtml, sendEmail } from "../config/mailer.js";

dotenv.config();

const VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000;

function createVerificationToken() {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY_MS);

    return { token, tokenHash, expiresAt };
}

function getFrontendBaseUrl() {
    return process.env.FRONTEND_BASE_URL || "http://localhost:5173";
}

async function sendVerificationEmail(user, rawToken) {
    const frontendBase = getFrontendBaseUrl();
    const verificationUrl = `${frontendBase}/verify-email?email=${encodeURIComponent(user.email)}&token=${rawToken}`;

    await sendEmail({
        to: user.email,
        subject: "Verify your email",
        html: buildVerificationEmailHtml({
            appName: "Gursha",
            verificationUrl,
        }),
    });

    if (!process.env.SMTP_HOST) {
        console.info(`Verification URL (dev): ${verificationUrl}`);
    }
}

export async function registerUser(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;
        const normalizedEmail = email.toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const { token, tokenHash, expiresAt } = createVerificationToken();

        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            isEmailVerified: false,
            emailVerificationToken: tokenHash,
            emailVerificationExpiresAt: expiresAt,
        });

        await sendVerificationEmail(user, token);

        return res.status(201).json({
            message:
                "User registered successfully. Please verify your email before login.",
            requiresVerification: true,
            email: user.email,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isEmailVerified: user.isEmailVerified,
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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                message: "Please verify your email before logging in.",
                requiresVerification: true,
                email: user.email,
            });
        }

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

export async function verifyEmail(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, token } = req.body;
        const normalizedEmail = email.toLowerCase();
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ message: "Invalid verification request" });
        }

        if (user.isEmailVerified) {
            return res.status(200).json({ message: "Email is already verified" });
        }

        if (
            !user.emailVerificationToken ||
            user.emailVerificationToken !== tokenHash ||
            !user.emailVerificationExpiresAt ||
            user.emailVerificationExpiresAt < new Date()
        ) {
            return res.status(400).json({
                message: "Verification link is invalid or has expired",
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpiresAt = undefined;
        await user.save();

        return res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        console.error("Verify email error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

export async function resendVerificationEmail(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email } = req.body;
        const normalizedEmail = email.toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(200).json({
                message: "If this email exists, a verification link has been sent.",
            });
        }

        if (user.isEmailVerified) {
            return res.status(200).json({ message: "Email is already verified" });
        }

        const { token, tokenHash, expiresAt } = createVerificationToken();
        user.emailVerificationToken = tokenHash;
        user.emailVerificationExpiresAt = expiresAt;
        await user.save();

        await sendVerificationEmail(user, token);

        return res.status(200).json({
            message: "Verification email sent successfully",
        });
    } catch (error) {
        console.error("Resend verification error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

export async function getCurrentUser(req, res) {
    const { userId } = req.user;

    try {
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "Current user info", user });
    } catch (error) {
        console.error("Get current user error:", error);
        return res
            .status(500)
            .json({ message: "Server error", error: error.message });
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { restaurantId } = req.body;
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.role = "staff";
        user.restaurant = restaurantId;

        await user.save();

        return res.status(200).json({
            message: "User promoted to staff successfully",
            user,
        });
    } catch (error) {
        console.error("Error assigning staff role:", error);

        if (error.kind == "ObjectId") {
            return res.status(400).json({
                message: "Invalid Restaurant id.",
            });
        }
        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
}
