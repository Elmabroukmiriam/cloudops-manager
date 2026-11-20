import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, Max, Min } from 'class-validator';
import { MetricType, Severity } from '@prisma/client';

export class CreateAlertRuleDto {
  @ApiProperty({ enum: MetricType })
  @IsEnum(MetricType)
  metric: MetricType;

  @ApiProperty({ example: 80, description: 'Threshold in percent' })
  @IsNumber() @Min(0) @Max(100)
  threshold: number;

  @ApiProperty({ enum: Severity })
  @IsEnum(Severity)
  severity: Severity;

  @ApiProperty({ example: 1 })
  @IsInt()
  serverId: number;
}