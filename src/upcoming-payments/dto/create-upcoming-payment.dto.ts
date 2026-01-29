import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUpcomingPaymentDto {
  @ApiProperty({ example: '2026-02-01' })
  @IsDateString()
  payment_date: string;

  @ApiProperty({ example: 'Arriendo' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 450000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 1, description: 'ID de categoría' })
  @IsInt()
  category_id: number;

  @ApiProperty({ example: 'pending' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiPropertyOptional({ example: 'home' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: '#10B981' })
  @IsOptional()
  @IsString()
  icon_color?: string;
}
