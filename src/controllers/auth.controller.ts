import User, { IUser } from '../models/user.model'
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'
import { deleteCache, getCache, setCache } from '../config/redis';
import { sendEmail } from '../utils/email';

// console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'EXISTS' : 'MISSING');
// console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? 'EXISTS' : 'MISSING');


export const generateTokens = (firstName: string, lastName: string, email: string, _id: string) => {
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
        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        console.log('verificationToken', verificationToken)
        await setCache(`email_verification_${verificationToken}`, user._id.toString(), 3600)

        // Send verification email
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
        await sendEmail({
            to: user.email,
            subject: `Email verification`,
            html: `
        <h1>Welcome to Project Management App!</h1>
        <p>Please click the link below to verify your email:</p>
        <a href="${verificationUrl}">Verify Email</a>
         <p>This link will expire in 1 hour.</p>
        `
        })

        //generate tokens
        const token = generateTokens(user.firstName, user.lastName, user.email, user._id.toString())
        console.log('token', token);
        console.log('user', user);

        if (user) {
            return res.status(201).json({
                success: true,
                message: "User registered successfully",
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                    isEmailVerified: user.isEmailVerified,
                    preferences: user.preferences
                },
                token
            })
        }
    } catch (error) {
        console.log('error found in user', error)
        res.status(500).json({
            success: "false",
            message: "Error Registering the user",
        })
    }
    next()
}

// verify email 

export const verifyEmail = async (req: Request, res: Response) => {

    try {
        const { token } = req.params;
        const userId = await getCache(`email_verification_${token}`)
        console.log('user id',userId)

        if (!userId) {
            return res.status(401).json({ message: "Invalid or expired verification token" })
        }
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.isEmailVerified) {
            return res.status(400).json({ message: "Email is already verified" })
        }
        user.isEmailVerified = true;
        await user.save();

        await deleteCache(`email_verification_${token}`)

        res.json({
            success: true,
            message: "Email has been verified successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "'Error verifying email'"
        })
    }
}

export const reverifyEmail = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(401).json({ message: "User with email not found" })
        }
        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }
        const verificationToken = crypto.randomBytes(32).toString('hex');
        console.log('re verify verificationToken',verificationToken)


        // Store the token in cache (set with an expiry, e.g., 1 hour)
        // Here, 3600 is seconds (1 hour)
        await setCache(`email_verification_${verificationToken}`, user._id.toString(), 3600);

        // Send verification email
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

        await sendEmail({
            to: user.email,
            subject: `Email verification`,
            html: `
        <h1>Welcome to Project Management App!</h1>
        <p>Please click the link below to verify your email:</p>
        <a href="${verificationUrl}">Verify Email</a>
         <p>This link will expire in 1 hour.</p>
        `
        })
        return res.json({ success: true, message: 'Verification email resent' })

    } catch (error) {
        console.log('error in reverify email', error)
        res.status(500).json({ message: 'Could not resend verification email' });
    }
}

export const login = () => {

}
// // In your controller file
// const initializeAuth = () => {
//   console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'EXISTS' : 'MISSING');
//   console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? 'EXISTS' : 'MISSING');
// };
