import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';

@Injectable()
export class ServersService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateServerDto) {
    return this.prisma.server.create({ data: dto });
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {};
    const [data, total] = await Promise.all([
      this.prisma.server.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.server.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const server = await this.prisma.server.findUnique({
      where: { id },
      include: { applications: true },
    });
    if (!server) throw new NotFoundException(`Serveur ${id} introuvable`);
    return server;
  }

  async update(id: number, dto: UpdateServerDto) {
    await this.findOne(id);
    return this.prisma.server.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.server.delete({ where: { id } });
  }
}