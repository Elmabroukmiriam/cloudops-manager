import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Site e-commerce' })
  @IsString() @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Boutique en ligne', required: false })
  @IsOptional() @IsString()
  description?: string;
}