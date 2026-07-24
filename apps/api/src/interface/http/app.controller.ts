import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { createScaffoldMessage, type ScaffoldMessage } from '../../domain/scaffold-message';

@ApiTags('scaffold')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Exibe a resposta mínima do scaffold da API.' })
  @ApiOkResponse({
    description: 'Resposta mínima da API.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Central Comercial API',
        },
      },
      required: ['message'],
    },
  })
  getRoot(): ScaffoldMessage {
    return createScaffoldMessage();
  }
}
