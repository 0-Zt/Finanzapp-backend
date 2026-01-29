import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCardPaymentDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  credit_card_id: number;

  @ApiProperty({ example: '2026-01-25' })
  @IsDateString()
  payment_date: string;

  @ApiProperty({ example: 150000, minimum: 0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ example: 'minimum' })
  @IsString()
  @IsOptional()
  payment_type?: string;

  @ApiPropertyOptional({ example: 'Pago realizado desde cuenta corriente' })
  @IsString()
  @IsOptional()
  notes?: string;
}
