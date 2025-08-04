import express from "express";
import { changePassword, forgotPassword, login, logout, registerUser, resetPassword, reverifyEmail, verifyEmail } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

const router = express.Router()

//public routes
router.post('/register', registerUser)
router.post('/verify-email/:token', verifyEmail)
router.post('/reverify-email', reverifyEmail)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)


//protected routes
router.put('/change-password', authenticate, changePassword)
router.post('/logout', authenticate, logout)

export default router