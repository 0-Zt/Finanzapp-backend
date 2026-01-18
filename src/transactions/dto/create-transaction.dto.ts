import { IsDateString, IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsDateString()
  transaction_date: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  category_id: number;

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsOptional()
  account?: string;
}
