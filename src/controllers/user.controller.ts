import User, { IUser } from '../models/user.model'
import { NextFunction, Request, Response } from 'express'

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { firstName, lastName, email, password, role = 'developer' } = req.body

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists with this email"
            })
        }
        console.log('user data received', req.body)
        const user = await User.create(
            {
                firstName,
                lastName,
                email,
                password,
                role
            }
        )
        if (user) {
            return res.status(201).json({
                success: true,
                message: "User registred successfully"
            })
        }
    } catch (error) {
        console.log('error found in user', error)
    }
    next()
}