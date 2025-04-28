import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './src/config/swagger.js';
import { initKafka } from './src/utils/kafka.js';
import fs from 'fs';

// Load env variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory');
}

// Import routes
import authRoutes from './src/routes/authRoutes.js';
import customerRoutes from './src/routes/customerRoutes.js';
import restaurantRoutes from './src/routes/restaurantRoutes.js';
import publicRoutes from './src/routes/publicRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';

// Create Express app
const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })
);
console.log('CORS configured with origin:', process.env.CORS_ORIGIN || 'http://localhost:3000');

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Body parsers
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ubereats';
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    // Don't exit process, try to continue with limited functionality
  });

// Session management (stored in MongoDB)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'uber_eats_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoUri, collectionName: 'sessions' }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api', orderRoutes); // /orders/:orderId
app.use('/api', publicRoutes); // Public endpoints such as /restaurants etc.

// Swagger documentation route
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Default route
app.get('/health', (req, res) => res.json({ status: 'UP' }));

// 404 handler
app.use((req, res, next) => {
  return res.status(404).json({ message: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Start Kafka with proper error handling
(async () => {
  try {
    const kafkaConnected = await initKafka();
    if (kafkaConnected) {
      console.log('✅ Kafka services initialized successfully');
    } else {
      console.log('⚠️ Kafka initialization partial or failed - some features may be unavailable');
    }
  } catch (error) {
    console.error('❌ Kafka initialization error:', error.message);
    console.log('⚠️ Continuing without Kafka services - some features may be unavailable');
  }
})();

const PORT = process.env.PORT || 5015;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
 