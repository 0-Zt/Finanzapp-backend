import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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
}
