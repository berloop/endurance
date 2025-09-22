import { PrismaClient } from '@prisma/client'

const globalForPrisma = global
globalForPrisma.prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query'],
})

export const prisma = globalForPrisma.prisma

if (process.env.NODE_ENV !== 'production') {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query'],
    })
  }
}