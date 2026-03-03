import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ example: '2026-01-15' })
  @IsDateString()
  transaction_date: string;

  @ApiProperty({ example: 'Supermercado' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 1, description: 'ID de categoría' })
  @IsNumber()
  category_id: number;

  @ApiProperty({ example: 19990 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'paid' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiPropertyOptional({ example: 'Cuenta Corriente' })
  @IsString()
  @IsOptional()
  account?: string;

  @ApiPropertyOptional({ example: 3, description: 'Cantidad de cuotas (solo para categorías de tarjeta de crédito)', minimum: 1 })
  @IsInt()
  @IsOptional()
  @Min(1)
  installments?: number;
}
