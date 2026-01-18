import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlySalary?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(31)
  salaryDay?: number;

  @IsString()
  @IsOptional()
  currency?: string;
}
