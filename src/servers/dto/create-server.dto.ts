import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsIP, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ServerStatus } from '@prisma/client';

export class CreateServerDto {
  @ApiProperty({ example: 'srv-prod-01' })
  @IsString() @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'AWS' })
  @IsString() @IsNotEmpty()
  provider: string;

  @ApiProperty({ example: 'eu-west-3' })
  @IsString() @IsNotEmpty()
  region: string;

  @ApiProperty({ example: 4, description: 'Nombre de CPU' })
  @IsInt() @Min(1)
  cpu: number;

  @ApiProperty({ example: 16, description: 'RAM en Go' })
  @IsInt() @Min(1)
  ram: number;

  @ApiProperty({ example: 200, description: 'Stockage en Go' })
  @IsInt() @Min(1)
  storage: number;

  @ApiProperty({ example: '192.168.1.10' })
  @IsIP()
  ipAddress: string;

  @ApiProperty({ enum: ServerStatus, required: false })
  @IsOptional() @IsEnum(ServerStatus)
  status?: ServerStatus;

  @ApiProperty({ example: 1 })
  @IsInt()
  environmentId: number;
}