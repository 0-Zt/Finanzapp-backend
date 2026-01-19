import { IsNumber, IsNotEmpty, IsPositive, IsOptional, IsString, Matches, IsBoolean } from 'class-validator';

export class CreateCategoryBudgetDto {
  @IsNumber()
  @IsNotEmpty()
  category_id: number;

  @IsNumber()
  @IsPositive()
  budget_amount: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  budget_month?: string;

  @IsOptional()
  @IsBoolean()
  rollover_enabled?: boolean;
}
