import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';

@Injectable()
export class EnvironmentsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateEnvironmentDto) {
    return this.prisma.environment.create({ data: dto });
  }

  async findAll(page = 1, limit = 10, projectId?: number) {
    const where = projectId ? { projectId } : {};
    const [data, total] = await Promise.all([
      this.prisma.environment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.environment.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const env = await this.prisma.environment.findUnique({
      where: { id },
      include: { servers: true },
    });
    if (!env) throw new NotFoundException(`Environment ${id} not found`);
    return env;
  }

  async update(id: number, dto: UpdateEnvironmentDto) {
    await this.findOne(id);
    return this.prisma.environment.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.environment.delete({ where: { id } });
  }
}