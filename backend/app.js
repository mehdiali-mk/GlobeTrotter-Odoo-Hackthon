import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import AppError from './utils/appError.util.js';
import { globalErrorHandler } from './controllers/Errors.controller.js';

// ─── ROUTE IMPORTS ──────────────────────────────────────────────────────────────
import authRouter from './routes/Auth.routes.js';
import dashboardRouter from './routes/Dashboard.routes.js';
import tripRouter from './routes/Trip.routes.js';
import cityRouter from './routes/City.routes.js';
import activityCatalogRouter from './routes/ActivityCatalog.routes.js';
import userRouter from './routes/User.routes.js';
import communityPostRouter from './routes/CommunityPost.routes.js';
import adminRouter from './routes/Admin.routes.js';

dotenv.config({ path: './.env' });

const app = express();

// ─── GLOBAL MIDDLEWARE ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10kb' }));
app.set('query parser', 'extended');

// ─── MOUNT ROUTES ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/trips', tripRouter);
app.use('/api/v1/cities', cityRouter);
app.use('/api/v1/activities', activityCatalogRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/community', communityPostRouter);
app.use('/api/v1/admin', adminRouter);

// ─── UNHANDLED ROUTES ───────────────────────────────────────────────────────────
app.all('/{*path}', (request, response, next) => {
  next(new AppError(`Can't find ${request.originalUrl} on this server!`, 404));
});

// ─── GLOBAL ERROR HANDLER ───────────────────────────────────────────────────────
app.use(globalErrorHandler);

export default app;