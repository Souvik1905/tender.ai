const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');
const { initScheduler } = require('./services/scheduler');
// Route imports
const authRoutes = require('./routes/authRoutes');
const tenderRoutes = require('./routes/tenderRoutes');
const userRoutes = require('./routes/userRoutes');
// Initialize Express App
const app = express();
// Set HTTP Security Headers
app.use(helmet());
// Enable CORS
app.use(cors());
// Body Parser Middleware
app.use(express.json());
// HTTP Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Health Check / Root Endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Tender.ai Backend Service API is running',
    environment: process.env.NODE_ENV,
    simulationMode: process.env.SCRAPER_SIMULATION_MODE === 'true',
    timestamp: new Date()
  });
});
// Register Api Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/user', userRoutes);
// Middleware for handling undefined endpoints (404)
app.use(notFoundHandler);
// Global Error Handler Middleware
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
// Connect to Database, then Start Server
async function startServer() {
  try {
    await connectDB();
  } catch (error) {
    logger.error('Database connection failed during startup, but the server will continue to run. %O', error);
  }

  app.listen(PORT, () => {
    logger.info(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    initScheduler();
  });
}
startServer();
