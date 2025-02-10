// src/expense-categories/dto/create-expense-category.dto.ts
import { IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';

export class CreateExpenseCategoryDto {
  // Opcional: Si la categoría es creada por un usuario, se incluirá su ID; para las categorías por defecto, puede ser nulo.
  @IsOptional()
  @IsInt()
  user_id?: number;

  @IsString()
  name: string;

  @IsString()
  icon: string;

  @IsString()
  icon_color: string;

  // Indica si la categoría es por defecto
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
