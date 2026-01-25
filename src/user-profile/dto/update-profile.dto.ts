import { IsString, IsNumber, IsOptional, Min, Max, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class NotificationPreferencesDto {
  @IsBoolean()
  @IsOptional()
  budget_warning?: boolean;

  @IsBoolean()
  @IsOptional()
  budget_exceeded?: boolean;

  @IsBoolean()
  @IsOptional()
  payment_reminder?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(30)
  payment_reminder_days?: number;

  @IsBoolean()
  @IsOptional()
  goal_deadline?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(30)
  goal_deadline_days?: number;

  @IsBoolean()
  @IsOptional()
  card_payment_due?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(30)
  card_payment_due_days?: number;

  @IsBoolean()
  @IsOptional()
  fixed_expense_due?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(30)
  fixed_expense_due_days?: number;
}

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

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationPreferencesDto)
  notificationPreferences?: NotificationPreferencesDto;
}
