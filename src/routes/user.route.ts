import express from "express";
import { registerUser } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth";

const router = express.Router()

router.post('/register', registerUser)


export default router