import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class UpdateCategoryBudgetDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  budget_amount?: number;
}
