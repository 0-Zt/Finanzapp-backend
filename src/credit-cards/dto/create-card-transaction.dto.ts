import { IsDateString, IsNotEmpty, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreateCardTransactionDto {
  @IsNumber()
  credit_card_id: number;

  @IsDateString()
  transaction_date: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  @IsOptional()
  category_id?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  installments?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  current_installment?: number;

  @IsNumber()
  @IsOptional()
  installment_amount?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
