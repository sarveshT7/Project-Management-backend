import User, { IUser } from '../models/user.model'
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'

console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'EXISTS' : 'MISSING');
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? 'EXISTS' : 'MISSING');


export const generateTokens = (userInfo: IUser) => {
    const { firstName, lastName, email, _id } = userInfo
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    const secret = process.env.JWT_SECRET;
    const expiresIn = '7d'
    const refreshExpires = '21d'

    const payload = {
        _id: _id,
        firstName: firstName,
        lastName: lastName,
        email: email
    };

    if (!secret || !jwtRefreshSecret || !expiresIn) {
        throw new Error('ENV variables are not configured properly')
    }
    const accessToken = jwt.sign(
        payload,
        secret,
        { expiresIn: expiresIn }
    )

    const refreshToken = jwt.sign(
        payload,
        jwtRefreshSecret,
        { expiresIn: refreshExpires }
    )
    return { accessToken, refreshToken }

}

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



export const login = () => {
    
}
// // In your controller file
// const initializeAuth = () => {
//   console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'EXISTS' : 'MISSING');
//   console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? 'EXISTS' : 'MISSING');
// };
