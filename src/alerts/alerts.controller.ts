import { Controller, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { AlertsService } from './alerts.service';

@ApiTags('Alerts')
@ApiBearerAuth()
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('serverId') serverId?: string,
  ) {
    return this.alertsService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
      status,
      severity,
      serverId ? Number(serverId) : undefined,
    );
  }

  @Roles(Role.ADMIN, Role.DEVOPS)
  @Patch(':id/acknowledge')
  acknowledge(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.acknowledge(id);
  }

  @Roles(Role.ADMIN, Role.DEVOPS)
  @Patch(':id/resolve')
  resolve(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.resolve(id);
  }
}