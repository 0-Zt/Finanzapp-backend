// src/financial-goals/dto/update-financial-goal.dto.ts
import { IsInt, IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class UpdateFinancialGoalDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  current_amount?: number;

  @IsOptional()
  @IsNumber()
  target_amount?: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsString()
  icon?: string;
}
