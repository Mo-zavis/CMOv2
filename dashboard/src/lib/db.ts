import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Prisma runtime resolves file: paths relative to node_modules/.prisma/client/,
// not relative to prisma/schema.prisma. Use an absolute path to avoid misresolution.
const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: { url: `file:${dbPath}` },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
