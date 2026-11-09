import mongoose from 'mongoose';
import { spawn } from 'child_process';
import { existsSync, mkdirSync, openSync } from 'fs';
import path from 'path';
import { config } from './env.ts';

let mongodProcess: any = null;

function maskMongoUri(uri: string): string {
  try {
    if (uri.includes('127.0.0.1') || uri.includes('localhost')) {
      return uri;
    }
    // Mask password in cloud connection strings: mongodb+srv://user:pass@host -> mongodb+srv://user:****@host
    return uri.replace(/(\/\/[^:]+:)[^@]+(@)/, '$1****$2');
  } catch {
    return 'mongodb://[protected]';
  }
}

async function trySpawnLocalMongod(): Promise<boolean> {
  const possiblePaths = [
    'C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
  ];

  const binaryPath = possiblePaths.find((p) => existsSync(p));
  if (!binaryPath) return false;

  const dbDir = path.resolve(process.cwd(), 'data', 'db');
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }

  const logFile = path.resolve(process.cwd(), 'data', 'mongod.log');
  const out = openSync(logFile, 'a');

  console.log(`[Database] Attempting to start local MongoDB from: ${binaryPath}`);
  try {
    mongodProcess = spawn(
      binaryPath,
      ['--dbpath', dbDir, '--bind_ip', '127.0.0.1', '--port', '27017'],
      {
        detached: false,
        stdio: ['ignore', out, out],
      }
    );

    mongodProcess.unref();

    // Give it 2.5 seconds to start WiredTiger and open port
    await new Promise((res) => setTimeout(res, 2500));
    return true;
  } catch (err) {
    console.warn('[Database] Could not spawn local mongod daemon:', err);
    return false;
  }
}

export async function connectDB(): Promise<void> {
  try {
    const isAtlas = config.mongoUri.includes('mongodb+srv://');
    console.log(`[Database] Connecting to MongoDB at ${maskMongoUri(config.mongoUri)}...`);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: isAtlas || config.isProduction ? 10000 : 2500,
    });
    console.log('[Database] Connected to MongoDB successfully! 🧠');
  } catch (initialErr: any) {
    console.warn(`[Database] Initial MongoDB connection attempt failed: ${initialErr.message}`);

    // If local uri, try to spawn local mongod
    if (config.mongoUri.includes('127.0.0.1') || config.mongoUri.includes('localhost')) {
      const spawned = await trySpawnLocalMongod();
      if (spawned) {
        try {
          await mongoose.connect(config.mongoUri, {
            serverSelectionTimeoutMS: 5000,
          });
          console.log('[Database] Connected to locally spawned MongoDB successfully! 🧠');
          return;
        } catch (retryErr: any) {
          console.error('[Database] Failed to connect after starting local MongoDB:', retryErr.message);
        }
      }
    }

    throw initialErr;
  }
}

process.on('exit', () => {
  if (mongodProcess && !mongodProcess.killed) {
    try {
      mongodProcess.kill();
    } catch {}
  }
});
