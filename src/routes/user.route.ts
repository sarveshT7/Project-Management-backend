import express from "express";
import { registerUser } from "../controllers/user.controller";

const router = express.Router()
// router.post('/register', registerUser)
router.post('/register', (req, res, next) => {
    console.log('🔥 REGISTER ROUTE HIT!');
    next();
}, registerUser)



export default router