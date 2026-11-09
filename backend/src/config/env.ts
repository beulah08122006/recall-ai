import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robust .env resolution: checks backend/.env relative to this file, then working directory
const backendEnvPath = path.resolve(__dirname, '../../.env');
const explicitBackendEnv = path.resolve(process.cwd(), 'backend/.env');
const cwdEnvPath = path.resolve(process.cwd(), '.env');

if (existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
} else if (existsSync(explicitBackendEnv)) {
  dotenv.config({ path: explicitBackendEnv });
} else if (existsSync(cwdEnvPath)) {
  dotenv.config({ path: cwdEnvPath });
} else {
  dotenv.config();
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/recallai',
  jwtSecret: process.env.JWT_SECRET || 'recall_ai_super_secure_jwt_secret_key_2026_dev',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  isProduction: process.env.NODE_ENV === 'production',
};


