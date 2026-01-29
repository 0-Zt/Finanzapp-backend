import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFinancialGoalDto {
  @ApiProperty({ example: 'Fondo de emergencia' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 200000 })
  @IsNumber()
  current_amount: number;

  @ApiProperty({ example: 1000000 })
  @IsNumber()
  target_amount: number;

  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  deadline: string;

  @ApiPropertyOptional({ example: 'target' })
  @IsOptional()
  @IsString()
  icon?: string;
}
