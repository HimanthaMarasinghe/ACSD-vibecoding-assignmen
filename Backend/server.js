import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { requireAuth, requireAdmin } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Allow CORS for local frontend, configured FRONTEND_URL env var, or all origins in dev/postman
app.use(cors({
  origin: (origin, callback) => {
    // Allow Postman/server-to-server (no origin header) or match frontend URL
    if (!origin) return callback(null, true);
    const allowed = [
      'http://localhost:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowed.includes(origin) || !process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all origins by default if FRONTEND_URL is not set
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', requireAuth, productRoutes);
app.use('/api/orders', requireAuth, orderRoutes);
app.use('/api/admin', requireAuth, requireAdmin, adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'CeylonCart API is running' });
});

app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'CeylonCart Backend API is active' });
});

// Only listen when running locally directly
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
