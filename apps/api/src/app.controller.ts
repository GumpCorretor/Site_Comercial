import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { AppService, type AppInfo } from './app.service.js'

/**
 * Endpoint da base do scaffold. Sem regra de domínio e sem health check
 * (T-08) — só confirma que a API subiu e que o Swagger consegue documentá-la.
 */
@ApiTags('base')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Endpoint base do scaffold da API' })
  getRoot(): AppInfo {
    return this.appService.getInfo()
  }
}
