import express from 'express';
import dotenv from 'dotenv'
import { connectDB } from './config/db';
import userRoutes from './routes/auth.route';
import projectRoutes from './routes/project.route';
import { connectRedis } from './config/redis';

dotenv.config()
connectDB();
connectRedis();
const app = express()
const PORT = process.env.PORT || 5000

// app.use((req, res, next) => {
//     console.log(`REQUEST: ${req.method} ${req.url}`);
//     console.log(`Body:`, req.body);
//     next();
// });
// initializeAuth()
app.use(express.json())

app.use('/api/v1/users', userRoutes)
app.use('/api/v1/projects', projectRoutes)

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
