import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  DATABASE_HEALTH_CHECK,
  type DatabaseHealthCheck,
} from '../../../application/health/database-health-check';

interface HealthResponse {
  readonly status: 'ok';
  readonly database: 'up';
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject(DATABASE_HEALTH_CHECK)
    private readonly databaseHealthCheck: DatabaseHealthCheck,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifica a disponibilidade do PostgreSQL.' })
  @ApiOkResponse({
    description: 'PostgreSQL disponível.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        database: { type: 'string', example: 'up' },
      },
      required: ['status', 'database'],
    },
  })
  @ApiServiceUnavailableResponse({
    description: 'PostgreSQL indisponível.',
  })
  async getHealth(): Promise<HealthResponse> {
    try {
      await this.databaseHealthCheck.check();
      return { status: 'ok', database: 'up' };
    } catch {
      throw new ServiceUnavailableException('Database unavailable');
    }
  }
}
