import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check whether the API is available' })
  @ApiOkResponse({ description: 'The API is healthy.' })
  check() {
    return {
      status: 'ok' as const,
      service: 'studyverse-api' as const,
      timestamp: new Date().toISOString(),
    };
  }
}
