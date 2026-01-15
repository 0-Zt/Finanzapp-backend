
import { IsInt, IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateFinancialGoalDto {
  @IsInt()
  user_id: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  current_amount: number;

  @IsNumber()
  target_amount: number;

  @IsDateString()
  deadline: string;

  @IsOptional()
  @IsString()
  icon?: string;
}
