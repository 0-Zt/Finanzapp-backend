// src/expense-categories/dto/update-expense-category.dto.ts
import { IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';

export class UpdateExpenseCategoryDto {
  @IsOptional()
  @IsInt()
  user_id?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  icon_color?: string;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
