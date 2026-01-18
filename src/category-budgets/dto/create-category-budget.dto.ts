import { IsNumber, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateCategoryBudgetDto {
  @IsNumber()
  @IsNotEmpty()
  category_id: number;

  @IsNumber()
  @IsPositive()
  budget_amount: number;
}
