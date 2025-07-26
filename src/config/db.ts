import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGO_URI
        if (!mongoURI) {
            throw new Error('MongoDB URI is not defined in environment variables')
        }
        const conn = await mongoose.connect(mongoURI);
        console.log(`MongoDB connected: ${conn.connection.host} `)

        // Handle connection events
        mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err))
        mongoose.connection.on('disconnected', () => console.error('MongoDB disconnected'))

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}