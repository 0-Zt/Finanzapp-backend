import { IsNumber, IsOptional, IsPositive, IsBoolean } from 'class-validator';

export class UpdateCategoryBudgetDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  budget_amount?: number;

  @IsOptional()
  @IsBoolean()
  rollover_enabled?: boolean;
}
