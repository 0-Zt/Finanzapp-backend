import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class UpdateCategoryBudgetDto {
  @ApiPropertyOptional({ example: 300000, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  budget_amount?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  rollover_enabled?: boolean;
}
