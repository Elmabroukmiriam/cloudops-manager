import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, Max, Min } from 'class-validator';
import { MetricType } from '@prisma/client';

export class CreateMetricDto {
  @ApiProperty({ enum: MetricType })
  @IsEnum(MetricType)
  type: MetricType;

  @ApiProperty({ example: 73.5, description: 'Pourcentage d’utilisation (0 à 100)' })
  @IsNumber() @Min(0) @Max(100)
  value: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  serverId: number;
}