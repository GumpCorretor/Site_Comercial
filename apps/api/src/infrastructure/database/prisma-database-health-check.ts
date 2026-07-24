import type { OnModuleDestroy } from '@nestjs/common';
import { createPrismaClient, type PrismaClient } from '@central-comercial/db';

import type { DatabaseHealthCheck } from '../../application/health/database-health-check';

export class PrismaDatabaseHealthCheck implements DatabaseHealthCheck, OnModuleDestroy {
  private readonly prisma: PrismaClient;

  constructor(connectionString: string) {
    this.prisma = createPrismaClient(connectionString);
  }

  async check(): Promise<void> {
    await this.prisma.$queryRaw`SELECT 1`;
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
