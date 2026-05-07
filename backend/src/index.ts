import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bookingRoutes from './routes/bookings';
import settingsRoutes from './routes/settings';
import incomeRoutes from './routes/income';
import expenseRoutes from './routes/expense';
import reportsRoutes from './routes/reports';
import slotsRoutes from './routes/slots';
import usersRoutes from './routes/users';
import profileRoutes from './routes/profile';
import activityRoutes from './routes/activity';
import authRoutes from './routes/auth';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings/slots', slotsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/activity', activityRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start Server
app.listen(port, () => {
  console.log(`[Server]: Backend running at http://localhost:${port}`);
});
