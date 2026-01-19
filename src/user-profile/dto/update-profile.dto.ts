import { IsString, IsNumber, IsOptional, Min, Max, IsBoolean } from 'class-validator';

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

  @IsBoolean()
  @IsOptional()
  onboardingCompleted?: boolean;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  budgetWarningThreshold?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  budgetExceededThreshold?: number;
}
