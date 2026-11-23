import { app } from './app.js';
import { ENV } from './config/env.js';
import { prisma } from './config/db.js';

const startServer = async () => {
  try {
    const server = app.listen(ENV.PORT, () => {
      console.log(`===============================================`);
      console.log(`🕌 Salat Tracker Backend running in ${ENV.NODE_ENV} mode`);
      console.log(`🚀 Port: http://localhost:${ENV.PORT}`);
      console.log(`📡 Health: http://localhost:${ENV.PORT}/api/v1/health`);
      console.log(`===============================================`);
    });

    const shutdown = async (signal: string) => {
      console.log(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('Database disconnected. Process exited.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Fatal error starting server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
