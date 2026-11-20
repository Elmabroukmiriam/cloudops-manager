import { Injectable } from '@nestjs/common';
import { AlertStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async summary() {
    const since = new Date(Date.now() - 24 * 3600 * 1000);

    const [
      projects,
      environments,
      servers,
      applications,
      serversByStatus,
      appsByStatus,
      openAlertsBySeverity,
      metricAverages,
    ] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.environment.count(),
      this.prisma.server.count(),
      this.prisma.application.count(),
      this.prisma.server.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.application.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.alert.groupBy({
        by: ['severity'],
        where: { status: AlertStatus.OPEN },
        _count: { _all: true },
      }),
      this.prisma.metric.groupBy({
        by: ['type'],
        where: { recordedAt: { gte: since } },
        _avg: { value: true },
      }),
    ]);

    const toMap = (rows: { _count: { _all: number } }[], key: string) =>
      Object.fromEntries(rows.map((r: any) => [r[key], r._count._all]));

    const serverStatus = toMap(serversByStatus, 'status');
    const online = serverStatus['ONLINE'] ?? 0;

    return {
      totals: { projects, environments, servers, applications },
      serversByStatus: serverStatus,
      applicationsByStatus: toMap(appsByStatus, 'status'),
      openAlertsBySeverity: toMap(openAlertsBySeverity, 'severity'),
      availabilityPercent: servers ? Math.round((online / servers) * 1000) / 10 : 0,
      averageUsage24h: Object.fromEntries(
        metricAverages.map((m) => [m.type, Math.round((m._avg.value ?? 0) * 10) / 10]),
      ),
    };
  }
}