// src/upcoming-payments/dto/update-upcoming-payment.dto.ts
import { IsInt, IsDateString, IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateUpcomingPaymentDto {
  @IsOptional()
  @IsDateString()
  payment_date?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsInt()
  category_id?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  icon_color?: string;
}
