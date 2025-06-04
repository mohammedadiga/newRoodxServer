import express, { Request, Response } from 'express';
// Utils
import { APP_CONFIG } from '@/config/app.config';
// Server HTTP Middleware
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
// Middleware
import { AsyncHandler } from '@/middleware/async.handler';
// Custom Errors
import { NotFoundException } from '@/common/errors/notFoundException';
import { ErrorHandler } from '@/middleware/error.handler';
import { connectDB } from '@/common/DB/database';

const app = express();
const PORT = APP_CONFIG.PORT;

// ✅ Improved Middleware
app.use(helmet()); // Security headers (Protect against common vulnerabilities)
app.use(express.json({ limit: '10mb' })); // Prevent large payloads and data attacks
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(cors({ origin: APP_CONFIG.APP_ORIGIN, credentials: true })); // CORS configuration
app.use(morgan(APP_CONFIG.NODE_ENV === 'development' ? 'dev' : 'combined')); // Logging middleware

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Express!');
});

// // ✅ All API Route (Handles undefined routes)
// app.all(
//   `*`,
//   AsyncHandler(async (req, res, next) => {
//     // Route not found
//     throw new NotFoundException(`Route ${req.originalUrl} not found`);
//   })
// );

// Middleware for Error handling
app.use(ErrorHandler); // Centralized error handler for the application

// ✅ Start the server and connect to the database
connectDB();

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT} in ${APP_CONFIG.NODE_ENV} mode.`);
});
