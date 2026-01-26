// src/financial-goals/dto/update-financial-goal.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateFinancialGoalDto {
  @ApiPropertyOptional({ example: 'Fondo de emergencia (actualizado)' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 250000 })
  @IsOptional()
  @IsNumber()
  current_amount?: number;

  @ApiPropertyOptional({ example: 1200000 })
  @IsOptional()
  @IsNumber()
  target_amount?: number;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({ example: 'target' })
  @IsOptional()
  @IsString()
  icon?: string;
}
