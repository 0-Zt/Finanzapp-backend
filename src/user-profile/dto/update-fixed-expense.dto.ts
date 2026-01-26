import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateFixedExpenseDto {
  @ApiPropertyOptional({ example: 'Internet hogar (actualizado)' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 27990, minimum: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional({ example: 7, minimum: 1, maximum: 31 })
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
