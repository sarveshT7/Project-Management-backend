import { NextFunction, Response, Request } from "express";
import { IUser } from "../models/user.model";
import jwt from "jsonwebtoken";
import User from '../models/user.model'

export interface AuthRequest extends Request {
    user?: IUser;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.get('Authorization')?.replace('Bearer ', '')
        if (!token) {
            return res.status(401).json({ message: "Access token is required" })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }
        const user = await User.findById(decoded.id).select('+password')

        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Invalid token or user not found' })
        }

        //update the last login
        user.lastLogin = new Date();
        user.save();

        req.user = user;
        next()

    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" })
        }
        if (!roles.includes(req.user.role)) {
            return res.status(401).json({ message: "Access denied. Insufficient permissions" })
        }
        next();
    }
}

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.get('Authorization')?.replace('Bearer ', '')
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }
            const user = await User.findById(decoded.id)

            if (user && user.isActive) {
                req.user = user
            }
        }
        next()
    } catch (error) {
        // Continue without user if token is invalid
        next()
    }
}