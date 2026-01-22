import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import fs from 'fs';
import { AddressInfo } from 'net';
import app from './app';
import { connectDB, disconnectDB } from './config/database';



const DEFAULT_PORT = process.env.PORT || '5000';

function normalizePort(val: string | number) {
  const port = typeof val === 'string' ? parseInt(val, 10) : val;
  if (Number.isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}

const port = normalizePort(DEFAULT_PORT) as number | string | false;
app.set('port', port);

let server: http.Server;

// Optional HTTPS if certs provided
if (process.env.SSL_KEY && process.env.SSL_CERT) {
  try {
    const key = fs.readFileSync(process.env.SSL_KEY);
    const cert = fs.readFileSync(process.env.SSL_CERT);
    // Lazy require to avoid adding https import when not used
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const https = require('https');
    server = https.createServer({ key, cert }, app);
    console.log('Starting HTTPS server');
  } catch (err) {
    console.error('Failed to read SSL key/cert, falling back to HTTP', err);
    server = http.createServer(app);
  }
} else {
  server = http.createServer(app);
}

function onError(error: NodeJS.ErrnoException) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address() as AddressInfo | string | null;
  if (!addr) return;
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  console.log(`Server listening on ${bind}`);
}

server.on('error', onError);
server.on('listening', onListening);

const serverInstance = server.listen(port as number);

// Start DB connection after server is created
(async function start() {
  try {
    await connectDB();
    const effectivePort = typeof port === 'string' ? port : (port as number);
    console.log(`Server is running on http://localhost:${effectivePort}`);
  } catch (err) {
    console.error('Failed to start application', err);
    process.exit(1);
  }
})();



// Graceful shutdown
let shuttingDown = false;

async function shutdown(signal?: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`Received ${signal ?? 'shutdown signal'}, closing server...`);

  // Attempt to disconnect DB first
  try {
    await disconnectDB();
  } catch (e) {
    console.error('Error during DB disconnect', e);
  }

  // Stop accepting new connections
  server.close((err?: any) => {
    if (err) {
      console.error('Error during server close', err);
      process.exit(1);
    }
    console.log('Closed out remaining connections');
    process.exit(0);
  });

  // Force shutdown after timeout
  setTimeout(() => {
    console.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 30000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (err: unknown) => {
  console.error('Uncaught Exception:', err);
  // attempt graceful shutdown
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Rejection at:', reason);
  // attempt graceful shutdown
  shutdown('unhandledRejection');
});

export default serverInstance;
