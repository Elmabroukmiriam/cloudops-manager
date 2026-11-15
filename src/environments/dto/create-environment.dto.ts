import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateEnvironmentDto {
  @ApiProperty({ example: 'prod', description: 'dev, staging, prod...' })
  @IsString() @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  projectId: number;
}