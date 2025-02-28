import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiKey: process.env.API_KEY,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  
  googleCloudProject: process.env.GOOGLE_CLOUD_PROJECT,
  googleCloudLocation: process.env.GOOGLE_CLOUD_LOCATION || 'us-west1',
  googleCloudAppCreds: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  googleAiModel: process.env.GOOGLE_AI_MODEL || 'gemini-1.5-pro'
};

// Validate required environment variables
export const validateEnv = () => {
  const required = ['API_KEY', 'DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};
