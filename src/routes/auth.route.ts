import express from "express";
import { registerUser, reverifyEmail, verifyEmail } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

const router = express.Router()

router.post('/register', registerUser)
router.post('/verify-email/:token', verifyEmail)
router.post('/reverify-email', reverifyEmail)


export default router