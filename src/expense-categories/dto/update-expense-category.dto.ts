// src/expense-categories/dto/update-expense-category.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateExpenseCategoryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  user_id?: number;

  @ApiPropertyOptional({ example: 'Supermercado' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'shopping_cart' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: '#22C55E' })
  @IsOptional()
  @IsString()
  icon_color?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
