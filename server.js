import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'mongo-sanitize';
import 'dotenv/config';
import { validateEnv } from './config/validateEnv.js';
import dbConnection from './config/db.js';
import { router } from "./routes/userRoute.js";
import usersRouter from './routes/usersRoute.js';
import projectRouter from './routes/projectRoute.js';
import bidRouter from './routes/bidRoute.js';
import { errorHandler } from './middleware/errorHandler.js';


validateEnv();

const port = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Security headers
app.use(helmet());

// CORS - lock to your frontend origin in production
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : true,
    credentials: true
}));

// Rate limiting - global
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

// Rate limiting - stricter for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many auth attempts, please try again later.' }
});
app.use('/api/auth', authLimiter);

// NoSQL injection sanitization
app.use((req, res, next) => {
    if (req.body) req.body = mongoSanitize(req.body);
    if (req.query) req.query = mongoSanitize(req.query);
    if (req.params) req.params = mongoSanitize(req.params);
    next();
});

app.use("/api/auth", router);
app.use("/api/users", usersRouter);
app.use("/api/projects", projectRouter);
app.use("/api/bids", bidRouter);

app.get('/', (req, res) => {
    res.send("hello");
})

// Global error handler - must be last
app.use(errorHandler);

dbConnection();

app.listen(port, (req, res) => {
    console.log(`server is listening at ${port}`);
})
