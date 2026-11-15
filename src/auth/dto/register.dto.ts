import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'maryem@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString() @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Maryem El Mabrouk' })
  @IsString() @IsNotEmpty()
  fullName: string;
}