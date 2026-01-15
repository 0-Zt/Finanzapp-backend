// src/upcoming-payments/dto/create-upcoming-payment.dto.ts
import { IsInt, IsDateString, IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateUpcomingPaymentDto {
  @IsInt()
  user_id: number;

  @IsDateString()
  payment_date: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  amount: number;

  @IsInt()
  category_id: number;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  icon_color?: string;
}
