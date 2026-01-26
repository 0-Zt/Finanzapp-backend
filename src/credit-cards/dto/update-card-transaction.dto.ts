import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCardTransactionDto {
  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  credit_card_id?: number;

  @ApiPropertyOptional({ example: '2026-01-15' })
  @IsDateString()
  @IsOptional()
  transaction_date?: string;

  @ApiPropertyOptional({ example: 'Compra supermercado (actualizada)' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 39990 })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsNumber()
  @IsOptional()
  category_id?: number;

  @ApiPropertyOptional({ example: 'pending' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 3, minimum: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  installments?: number;

  @ApiPropertyOptional({ example: 2, minimum: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  current_installment?: number;

  @ApiPropertyOptional({ example: 19995 })
  @IsNumber()
  @IsOptional()
  installment_amount?: number;

  @ApiPropertyOptional({ example: 'Notas adicionales' })
  @IsString()
  @IsOptional()
  notes?: string;
}
