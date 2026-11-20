import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AlertStatus, Metric, MetricType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMetricDto } from './dto/create-metric.dto';

@Injectable()
export class MetricsService {
  constructor(private prisma: PrismaService) {}

  private async ensureServer(id: number) {
    const server = await this.prisma.server.findUnique({ where: { id } });
    if (!server) throw new NotFoundException(`Server ${id} not found`);
  }

  // Compare the measure with the server's thresholds and create an alert if exceeded
  private async evaluate(metric: Metric) {
    const rules = await this.prisma.alertRule.findMany({
      where: {
        serverId: metric.serverId,
        metric: metric.type,
        threshold: { lte: metric.value },
      },
    });
    for (const rule of rules) {
      // No duplicate while an alert is still open for this rule
      const open = await this.prisma.alert.findFirst({
        where: { ruleId: rule.id, status: AlertStatus.OPEN },
      });
      if (open) continue;
      await this.prisma.alert.create({
        data: {
          message: `${metric.type} at ${metric.value}% exceeds threshold ${rule.threshold}%`,
          severity: rule.severity,
          serverId: metric.serverId,
          ruleId: rule.id,
        },
      });
    }
  }

  async create(dto: CreateMetricDto) {
    await this.ensureServer(dto.serverId);
    const metric = await this.prisma.metric.create({ data: dto });
    await this.evaluate(metric);
    return metric;
  }

  // Simulated data: one random CPU and one random RAM measure
  async simulate(serverId: number) {
    await this.ensureServer(serverId);
    const rand = () => Math.round((5 + Math.random() * 90) * 10) / 10;
    const metrics = await this.prisma.$transaction([
      this.prisma.metric.create({ data: { type: MetricType.CPU, value: rand(), serverId } }),
      this.prisma.metric.create({ data: { type: MetricType.RAM, value: rand(), serverId } }),
    ]);
    for (const m of metrics) await this.evaluate(m);
    return metrics;
  }

  async findAll(page = 1, limit = 10, serverId?: number, type?: string) {
    if (type && !(type in MetricType)) {
      throw new BadRequestException('type must be CPU or RAM');
    }
    const where = {
      ...(serverId && { serverId }),
      ...(type && { type: type as MetricType }),
    };
    const [data, total] = await Promise.all([
      this.prisma.metric.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { recordedAt: 'desc' },
      }),
      this.prisma.metric.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async history(serverId: number, hours = 24) {
    await this.ensureServer(serverId);
    const since = new Date(Date.now() - hours * 3600 * 1000);
    return this.prisma.metric.findMany({
      where: { serverId, recordedAt: { gte: since } },
      orderBy: { recordedAt: 'asc' },
    });
  }
}