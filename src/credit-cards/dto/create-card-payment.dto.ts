import { IsDateString, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreateCardPaymentDto {
  @IsNumber()
  credit_card_id: number;

  @IsDateString()
  payment_date: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  payment_type?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
