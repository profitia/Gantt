import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import tasksRouter from './tasks/tasks.router.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ PROSTA wersja CORS (działa zawsze na MVP)
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Root
app.get('/', (_req, res) => {
  res.json({
    name: 'Gantt Dashboard API',
    version: '1.0.0',
    endpoints: ['/health', '/tasks'],
  });
});

// Health
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/tasks', tasksRouter);

// Start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;