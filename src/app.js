import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth-routes.js';
import userRoutes from './routes/user-routes.js';
import globalErrorHandler from './controllers/error-contrroller.js';
import morgan from 'morgan'
import AppError from './utils/appError.js';

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Mavo API is running');
});

// app.all("*", (req, res, next) => {
//   next(new AppError("Route does not exist", 404))
// })

// Global error handler
app.use(globalErrorHandler);

export default app;
