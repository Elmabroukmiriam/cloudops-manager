import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { MetricsService } from './metrics.service';
import { CreateMetricDto } from './dto/create-metric.dto';

@ApiTags('Metrics')
@ApiBearerAuth()
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Roles(Role.ADMIN, Role.DEVOPS)
  @Post()
  create(@Body() dto: CreateMetricDto) {
    return this.metricsService.create(dto);
  }

  @Roles(Role.ADMIN, Role.DEVOPS)
  @Post('simulate/:serverId')
  simulate(@Param('serverId', ParseIntPipe) serverId: number) {
    return this.metricsService.simulate(serverId);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('serverId') serverId?: string,
    @Query('type') type?: string,
  ) {
    return this.metricsService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
      serverId ? Number(serverId) : undefined,
      type,
    );
  }

  @Get('server/:serverId/history')
  history(
    @Param('serverId', ParseIntPipe) serverId: number,
    @Query('hours') hours?: string,
  ) {
    return this.metricsService.history(serverId, Number(hours) || 24);
  }
}