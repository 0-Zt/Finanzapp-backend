import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCardTransactionDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  credit_card_id: number;

  @ApiProperty({ example: '2026-01-15' })
  @IsDateString()
  transaction_date: string;

  @ApiProperty({ example: 'Compra supermercado' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 45990 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 2 })
  @IsNumber()
  @IsOptional()
  category_id?: number;

  @ApiPropertyOptional({ example: 'paid' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 3, minimum: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  installments?: number;

  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  current_installment?: number;

  @ApiPropertyOptional({ example: 15330 })
  @IsNumber()
  @IsOptional()
  installment_amount?: number;

  @ApiPropertyOptional({ example: 'Compra con 3 cuotas sin interés' })
  @IsString()
  @IsOptional()
  notes?: string;
}
