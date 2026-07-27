import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'mongo-sanitize';
import 'dotenv/config';
import { validateEnv } from './config/validateEnv.js';
import dbConnection from './config/db.js';
import { router } from './routes/userRoute.js';
import usersRouter from './routes/usersRoute.js';
import projectRouter from './routes/projectRoute.js';
import bidRouter from './routes/bidRoute.js';
import { errorHandler } from './middleware/errorHandler.js';

validateEnv();

const port = process.env.PORT || 5000;
const app = express();

// Webhook route must receive raw Buffer for HMAC signature verification
// This MUST be registered before express.json() so it takes precedence
app.use('/api/users/wallet/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Security headers
app.use(helmet());

// CORS - lock to your frontend origin in production
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : 'http://localhost:5173',
    credentials: true,
  })
);
// Rate limiting - global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 10000, // relaxed for dev
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
})

// Rate limiting - stricter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100000, // Increased for dev testing ease
  message: {
    success: false,
    message: 'Too many auth attempts, please try again later.',
  },
});
app.use('/api/auth', authLimiter);

// NoSQL injection sanitization
// Note: In Express v5, req.query and req.params are read-only getters,
// so we sanitize req.body by reassignment and mutate query/params in-place.
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize(req.body);
  if (req.query) {
    const sanitizedQuery = mongoSanitize({ ...req.query });
    Object.keys(sanitizedQuery).forEach((key) => {
      req.query[key] = sanitizedQuery[key];
    });
  }
  if (req.params) {
    const sanitizedParams = mongoSanitize({ ...req.params });
    Object.keys(sanitizedParams).forEach((key) => {
      req.params[key] = sanitizedParams[key];
    });
  }
  next();
});

// Health check — no auth, no rate limit, reports DB state
// 200 = healthy, 503 = DB not connected
app.get('/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

  res.status(dbState === 1 ? 200 : 503).json({
    success: true,
    status: 'ok',
    environment: process.env.NODE_ENV,
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', router);
app.use('/api/users', usersRouter);
app.use('/api/projects', projectRouter);
app.use('/api/bids', bidRouter);

app.get('/', (req, res) => {
  res.send('hello');
});

// Global error handler - must be last
app.use(errorHandler);

dbConnection();

app.listen(port, () => {
  console.log(`server is listening at ${port}`);
});
