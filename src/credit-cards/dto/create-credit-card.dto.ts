import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateCreditCardDto {
  @ApiProperty({ example: 'Visa Platinum' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Banco de Chile' })
  @IsString()
  @IsNotEmpty()
  bank_name: string;

  @ApiPropertyOptional({ example: '1234', description: 'Últimos 4 dígitos' })
  @IsString()
  @IsOptional()
  last_four_digits?: string;

  @ApiPropertyOptional({ example: 'VISA' })
  @IsString()
  @IsOptional()
  card_type?: string;

  @ApiPropertyOptional({ example: 1000000, minimum: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  credit_limit?: number;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 31 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(31)
  billing_cycle_day?: number;

  @ApiPropertyOptional({ example: 25, minimum: 1, maximum: 31 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(31)
  payment_due_day?: number;

  @ApiPropertyOptional({ example: 5, minimum: 0, maximum: 100 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  minimum_payment_percentage?: number;

  @ApiPropertyOptional({ example: 2.5, minimum: 0, description: 'Interés mensual o anual (según backend)' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  interest_rate?: number;

  @ApiPropertyOptional({ example: 'CLP' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: '#7C3AED' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
