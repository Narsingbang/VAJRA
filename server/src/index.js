import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 KisanMitra AI Server listening on port ${PORT} [${env.NODE_ENV}]`);
  console.log(`Backend API ready at http://localhost:${PORT}/api/health`);
});

// Graceful shutdown handling
const shutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('Server closed. Process terminating.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
