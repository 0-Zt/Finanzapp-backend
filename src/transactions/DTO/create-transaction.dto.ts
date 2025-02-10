// src/transactions/dto/create-transaction.dto.ts
import { IsInt, IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsInt()
  user_id: number;

  @IsDateString()
  transaction_date: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  category_id: number;

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  status: string;
}
