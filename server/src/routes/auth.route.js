import express from "express";
import { check } from "express-validator";
import { registerUser, loginUser, getCurrentUser } from "../controllers/auth.controller.js";


const authRouter = express.Router();

authRouter.post("/register", [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], registerUser);
authRouter.post("/login", loginUser);
authRouter.get('/me', getCurrentUser);

export default authRouter;