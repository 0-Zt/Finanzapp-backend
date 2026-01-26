import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class NotificationPreferencesDto {
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  budget_warning?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  budget_exceeded?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  payment_reminder?: boolean;

  @ApiPropertyOptional({ example: 3, minimum: 1, maximum: 30 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(30)
  payment_reminder_days?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  goal_deadline?: boolean;

  @ApiPropertyOptional({ example: 7, minimum: 1, maximum: 30 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(30)
  goal_deadline_days?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  card_payment_due?: boolean;

  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 30 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(30)
  card_payment_due_days?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  fixed_expense_due?: boolean;

  @ApiPropertyOptional({ example: 2, minimum: 1, maximum: 30 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(30)
  fixed_expense_due_days?: number;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Simón' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ example: 2000000, minimum: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlySalary?: number;

  @ApiPropertyOptional({ example: 25, minimum: 1, maximum: 31 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(31)
  salaryDay?: number;

  @ApiPropertyOptional({ example: 'CLP' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  onboardingCompleted?: boolean;

  @ApiPropertyOptional({ example: 'America/Santiago' })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({ example: 80, minimum: 0, maximum: 100 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  budgetWarningThreshold?: number;

  @ApiPropertyOptional({ example: 100, minimum: 0, maximum: 100 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  budgetExceededThreshold?: number;

  @ApiPropertyOptional({ description: 'Preferencias de notificaciones', type: NotificationPreferencesDto })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationPreferencesDto)
  notificationPreferences?: NotificationPreferencesDto;
}
