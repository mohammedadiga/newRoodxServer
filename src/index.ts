import express from 'express';

import cookieParser from 'cookie-parser';
// Utils
import { APP_CONFIG } from '@/config/app.config';
// Server HTTP Middleware
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
// Middleware
import { AsyncHandler } from '@/middleware/async.handler';
import passport from '@/middleware/passport';
// Custom Errors
import { NotFoundException } from '@/common/errors/notFoundException';
import { ErrorHandler } from '@/middleware/error.handler';
// Database Connection
import { connectDB } from '@/common/db/database';
// Modules Routes
import { AuthModule } from '@/modules/auth/auth.module';
import { SessionModule } from './modules/session/session.module';

const app = express();
const PORT = APP_CONFIG.PORT;
const BASE_PATH = APP_CONFIG.BASE_PATH;

// ✅ Improved Middleware
app.use(helmet()); // Security headers (Protect against common vulnerabilities)
app.use(express.json({ limit: '10mb' })); // Prevent large payloads and data attacks
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(cors({ origin: APP_CONFIG.APP_ORIGIN, credentials: true })); // CORS configuration
app.use(morgan(APP_CONFIG.NODE_ENV === 'development' ? 'dev' : 'combined')); // Logging middleware

app.use(cookieParser());
app.use(passport.initialize());

// Auth routes
app.use(`${BASE_PATH}/auth`, AuthModule.routes);
app.use(`${BASE_PATH}/session`, SessionModule.routes);

// ✅ All API Route (Handles undefined routes)
app.all(
  '*path',
  AsyncHandler(async (req) => {
    // Route not found
    throw new NotFoundException(`Route ${req.originalUrl} not found`);
  })
);

// Middleware for Error handling
app.use(ErrorHandler); // Centralized error handler for the application

// ✅ Start the server and connect to the database
connectDB();

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT} in ${APP_CONFIG.NODE_ENV} mode.`);
});
