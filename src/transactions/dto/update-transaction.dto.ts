// src/transactions/dto/update-transaction.dto.ts
import { IsOptional, IsDateString, IsString, IsInt, IsNumber } from 'class-validator';

export class UpdateTransactionDto {
  @IsOptional()
  @IsDateString()
  transaction_date?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  category_id?: number;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
