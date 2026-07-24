import { Module, type DynamicModule, type Provider } from '@nestjs/common';

import {
  DATABASE_HEALTH_CHECK,
  type DatabaseHealthCheck,
} from './application/health/database-health-check';
import { PrismaDatabaseHealthCheck } from './infrastructure/database/prisma-database-health-check';
import { AppController } from './interface/http/app.controller';
import { HealthController } from './interface/http/health/health.controller';

export interface AppModuleOptions {
  readonly databaseUrl: string;
  readonly databaseHealthCheck?: DatabaseHealthCheck;
}

@Module({})
export class AppModule {
  static register(options: AppModuleOptions): DynamicModule {
    const databaseHealthProvider: Provider =
      options.databaseHealthCheck === undefined
        ? {
            provide: DATABASE_HEALTH_CHECK,
            useFactory: () => new PrismaDatabaseHealthCheck(options.databaseUrl),
          }
        : {
            provide: DATABASE_HEALTH_CHECK,
            useValue: options.databaseHealthCheck,
          };

    return {
      module: AppModule,
      controllers: [AppController, HealthController],
      providers: [databaseHealthProvider],
    };
  }
}
