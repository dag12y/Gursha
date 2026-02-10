import express from "express";
import { registerUser, loginUser, getCurrentUser } from "../controllers/auth.controller.js";


const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.get('/me', getCurrentUser);

export default authRouter;