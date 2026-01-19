import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class UpdateCreditCardDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  bank_name?: string;

  @IsString()
  @IsOptional()
  last_four_digits?: string;

  @IsString()
  @IsOptional()
  card_type?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  credit_limit?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(31)
  billing_cycle_day?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(31)
  payment_due_day?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  minimum_payment_percentage?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  interest_rate?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
