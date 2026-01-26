import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Matches } from 'class-validator';

export class CreateCategoryBudgetDto {
  @ApiProperty({ example: 1, description: 'ID de categoría' })
  @IsNumber()
  @IsNotEmpty()
  category_id: number;

  @ApiProperty({ example: 250000, description: 'Monto presupuestado', minimum: 0 })
  @IsNumber()
  @IsPositive()
  budget_amount: number;

  @ApiPropertyOptional({ example: '2026-01', description: 'Mes en formato YYYY-MM' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  budget_month?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  rollover_enabled?: boolean;
}
