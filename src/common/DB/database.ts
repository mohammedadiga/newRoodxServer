import mongoose from 'mongoose';
import { APP_CONFIG } from '@/config/app.config';

// MongoDB connection function
export const connectDB = async (): Promise<void> => {
  try {
    // 🔗 Connect to MongoDB using the connection string from the config file
    await mongoose.connect(APP_CONFIG.MONGO_URI); // Removed options as they are no longer needed
    console.log('✅ Connected to MongoDB'); // Logs a success message if the connection is successful
  } catch (error) {
    // ⚠️ Logs an error message and exits the process if the connection fails
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1); // Exit process with failure
  }
};
