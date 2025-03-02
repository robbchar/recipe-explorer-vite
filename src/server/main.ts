import express from "express";
import cors from 'cors';
import ViteExpress from "vite-express";
import { config, validateEnv } from './config/env';
import authRoutes from './routes/authRoutes';
import recipeRoutes from './routes/recipes';
import userRoutes from './routes/users';
import { authenticateToken } from './middleware/auth';

// Validate environment variables before starting the server
validateEnv();

const app = express();

app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/users', userRoutes);

// Protected routes
app.use('/api/recipes', authenticateToken, recipeRoutes);

// Use auth routes
app.use('/api/auth', authRoutes);

app.get("/hello", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});

ViteExpress.listen(app, config.port, () =>
  console.log(`Server is listening on port ${config.port}...`),
);
