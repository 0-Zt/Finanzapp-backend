import { IsDateString, IsString, IsNotEmpty, IsNumber, IsOptional, IsInt } from 'class-validator';

export class CreateUpcomingPaymentDto {
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
