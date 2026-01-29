import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateFixedExpenseDto {
  @ApiProperty({ example: 'Internet hogar' })
  @IsString()
  description: string;

  @ApiProperty({ example: 29990, minimum: 0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ example: 1, description: 'ID de categoría (opcional)' })
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 31, description: 'Día del mes en que vence' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(31)
  dueDay?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
