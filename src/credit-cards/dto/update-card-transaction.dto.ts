import { IsDateString, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class UpdateCardTransactionDto {
  @IsNumber()
  @IsOptional()
  credit_card_id?: number;

  @IsDateString()
  @IsOptional()
  transaction_date?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

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
