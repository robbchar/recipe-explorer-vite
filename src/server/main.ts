import express from "express";
import ViteExpress from "vite-express";
import { config, validateEnv } from './config/env.js';

// Validate environment variables before starting the server
validateEnv();

const app = express();

app.get("/hello", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});

ViteExpress.listen(app, config.port, () =>
  console.log(`Server is listening on port ${config.port}...`),
);
