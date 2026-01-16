import mongoose from 'mongoose';
import logger from './logger';

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/ecommerce';

export async function connectDB(): Promise<void> {
  try {
    const conn = await mongoose.connect(MONGO_URI);

    logger.log ? logger.log(`MongoDB Connected: ${conn.connection.host}`) : console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.log ? logger.log('Error connecting to DB', message) : console.error('Error connecting to DB', message);
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.log ? logger.log('MongoDB disconnected') : console.log('MongoDB disconnected');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.log ? logger.log('Error disconnecting DB', message) : console.error('Error disconnecting DB', message);
  }
}
