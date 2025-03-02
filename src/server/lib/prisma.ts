import { PrismaClient } from '@prisma/client';
import { config } from '../config/env';

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

// Log queries in development
if (config.nodeEnv !== 'production') {
  prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
    return result;
  });

  global.prisma = prisma;
}

export default prisma; 