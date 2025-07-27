import express from 'express';
import dotenv from 'dotenv'
import { connectDB } from './config/db';
import userRoutes from './routes/user.route';

dotenv.config()
connectDB()
const app = express()
const PORT = process.env.PORT || 5000

// app.use((req, res, next) => {
//     console.log(`REQUEST: ${req.method} ${req.url}`);
//     console.log(`Body:`, req.body);
//     next();
// });

app.use(express.json())

app.use('/api/v1', userRoutes)

app.get('/', (req, res) => {
    console.log('Root route hit');
    res.send('welcome to project management')
})

app.listen(PORT, (err) => {
    if (err) {
        console.log('error found listening', err)
    }
    console.log(`App listening on port ${PORT}`)
})
