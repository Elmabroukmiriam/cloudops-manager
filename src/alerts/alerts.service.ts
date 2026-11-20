import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AlertStatus, Severity } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  // ----- Rules (thresholds) -----
  async createRule(dto: CreateAlertRuleDto) {
    const server = await this.prisma.server.findUnique({ where: { id: dto.serverId } });
    if (!server) throw new NotFoundException(`Server ${dto.serverId} not found`);
    return this.prisma.alertRule.create({ data: dto });
  }

  findRules(serverId?: number) {
    return this.prisma.alertRule.findMany({
      where: serverId ? { serverId } : {},
      orderBy: { id: 'asc' },
    });
  }

  async removeRule(id: number) {
    const rule = await this.prisma.alertRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException(`Rule ${id} not found`);
    // Detach existing alerts so the incident history is kept
    await this.prisma.alert.updateMany({ where: { ruleId: id }, data: { ruleId: null } });
    return this.prisma.alertRule.delete({ where: { id } });
  }

  // ----- Alerts (incident history) -----
  async findAll(page = 1, limit = 10, status?: string, severity?: string, serverId?: number) {
    if (status && !(status in AlertStatus)) throw new BadRequestException('Invalid status');
    if (severity && !(severity in Severity)) throw new BadRequestException('Invalid severity');
    const where = {
      ...(status && { status: status as AlertStatus }),
      ...(severity && { severity: severity as Severity }),
      ...(serverId && { serverId }),
    };
    const [data, total] = await Promise.all([
      this.prisma.alert.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.alert.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  private async ensureAlert(id: number) {
    const alert = await this.prisma.alert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundException(`Alert ${id} not found`);
    return alert;
  }

  async acknowledge(id: number) {
    await this.ensureAlert(id);
    return this.prisma.alert.update({ where: { id }, data: { status: AlertStatus.ACKNOWLEDGED } });
  }

  async resolve(id: number) {
    await this.ensureAlert(id);
    return this.prisma.alert.update({
      where: { id },
      data: { status: AlertStatus.RESOLVED, resolvedAt: new Date() },
    });
  }
}