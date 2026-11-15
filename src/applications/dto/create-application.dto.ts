import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AppStatus } from '@prisma/client';

export class CreateApplicationDto {
  @ApiProperty({ example: 'api-gateway' })
  @IsString() @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '1.2.0' })
  @IsString() @IsNotEmpty()
  version: string;

  @ApiProperty({ enum: AppStatus, required: false })
  @IsOptional() @IsEnum(AppStatus)
  status?: AppStatus;

  @ApiProperty({ example: 1 })
  @IsInt()
  serverId: number;
}