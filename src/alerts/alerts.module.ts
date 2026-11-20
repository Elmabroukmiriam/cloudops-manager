import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { AlertRulesController } from './alert-rules.controller';

@Module({
  controllers: [AlertsController, AlertRulesController],
  providers: [AlertsService],
})
export class AlertsModule {}