const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const AppError = require('./utils/appError.util.js');
const { globalErrorHandler } = require('./controllers/Errors.controller.js');

// ─── ROUTE IMPORTS ──────────────────────────────────────────────────────────────
const authRouter = require('./routes/Auth.routes.js');
const dashboardRouter = require('./routes/Dashboard.routes.js');
const tripRouter = require('./routes/Trip.routes.js');
const cityRouter = require('./routes/City.routes.js');
const activityCatalogRouter = require('./routes/ActivityCatalog.routes.js');
const userRouter = require('./routes/User.routes.js');
const communityPostRouter = require('./routes/CommunityPost.routes.js');
const adminRouter = require('./routes/Admin.routes.js');

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

module.exports = app;