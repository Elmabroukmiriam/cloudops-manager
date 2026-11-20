import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { AlertsService } from './alerts.service';
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto';

@ApiTags('Alert rules')
@ApiBearerAuth()
@Controller('alert-rules')
export class AlertRulesController {
  constructor(private readonly alertsService: AlertsService) {}

  @Roles(Role.ADMIN, Role.DEVOPS)
  @Post()
  create(@Body() dto: CreateAlertRuleDto) {
    return this.alertsService.createRule(dto);
  }

  @Get()
  findAll(@Query('serverId') serverId?: string) {
    return this.alertsService.findRules(serverId ? Number(serverId) : undefined);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.removeRule(id);
  }
}