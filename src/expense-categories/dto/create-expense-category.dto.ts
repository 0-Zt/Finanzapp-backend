// src/expense-categories/dto/create-expense-category.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateExpenseCategoryDto {
  // Opcional: si la categoría es creada por un usuario, se incluirá su ID; para categorías por defecto, puede ser nulo.
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  user_id?: number;

  @ApiProperty({ example: 'Supermercado' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'shopping_cart' })
  @IsString()
  icon: string;

  @ApiProperty({ example: '#22C55E' })
  @IsString()
  icon_color: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
