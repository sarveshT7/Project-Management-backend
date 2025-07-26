import express from 'express';
import dotenv from 'dotenv'
import { connectDB } from './config/db';

dotenv.config()
connectDB()
const app = express()
const PORT = process.env.PORT || 5000



app.listen(PORT,() => console.log(`App listening on port ${PORT}`))
