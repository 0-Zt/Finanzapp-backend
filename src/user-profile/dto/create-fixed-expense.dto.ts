import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CreateFixedExpenseDto {
  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(31)
  dueDay?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
