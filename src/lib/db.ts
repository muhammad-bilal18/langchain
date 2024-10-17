import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectToDatabase(): Promise<typeof mongoose> {
    if (connectionPromise) {
        return connectionPromise;
    }

    const dbUri = process.env.MONGODB_URI;
    if (!dbUri) {
        throw new Error('MONGODB_URI is not defined in the environment variables');
    }

    connectionPromise = mongoose.connect(dbUri);

    try {
        await connectionPromise;
        return mongoose;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        connectionPromise = null;
        throw error;
    }
}