import express from 'express';
import cors from 'cors';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/env.ts';
import { connectDB } from './config/db.ts';
import { seedDemoData } from './utils/seed.ts';
import { errorHandler } from './middleware/errorHandler.ts';

// Routes
import authRoutes from './routes/authRoutes.ts';
import memoryRoutes from './routes/memoryRoutes.ts';
import itemRoutes from './routes/itemRoutes.ts';
import personRoutes from './routes/personRoutes.ts';
import reminderRoutes from './routes/reminderRoutes.ts';
import carryRoutes from './routes/carryRoutes.ts';
import routineRoutes from './routes/routineRoutes.ts';
import assistantRoutes from './routes/assistantRoutes.ts';
import insightRoutes from './routes/insightRoutes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/people', personRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/carry', carryRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/insights', insightRoutes);

// Health Check API
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'Recall AI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend static assets if built
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (existsSync(frontendDistPath)) {
  console.log(`[Static] Serving frontend from ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));

  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
      return;
    }
    next();
  });
} else {
  app.get('/', (_req, res) => {
    res.json({
      message: 'Recall AI backend is active 🧠',
      tagline: 'Your life, remembered.',
    });
  });
}

// Central Error Handler
app.use(errorHandler);

// Startup
async function bootstrap() {
  try {
    await connectDB();
    await seedDemoData(false);
    app.listen(config.port, () => {
      console.log(`===============================================`);
      console.log(`🧠 Recall AI Server is running on port ${config.port}`);
      console.log(`🌐 Local endpoint: http://localhost:${config.port}`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('[Bootstrap Error] Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
