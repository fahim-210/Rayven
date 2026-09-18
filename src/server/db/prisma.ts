import { PrismaClient } from '@prisma/client';

// Global singleton pattern to prevent multiple PrismaClient instances during hot-reloads
declare global {
  // eslint-disable-next-line no-var
  var __rayvenPrismaClient: PrismaClient | undefined;
}

export const prisma =
  global.__rayvenPrismaClient ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__rayvenPrismaClient = prisma;
}

export default prisma;
