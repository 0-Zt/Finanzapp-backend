import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateFixedExpenseDto } from './dto/create-fixed-expense.dto';
import { UpdateFixedExpenseDto } from './dto/update-fixed-expense.dto';

dotenv.config();

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  monthly_salary: number;
  salary_day: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface FixedExpense {
  id: number;
  user_id: string;
  description: string;
  amount: number;
  category_id: number | null;
  due_day: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class UserProfileService {
  private readonly logger = new Logger(UserProfileService.name);
  private readonly supabaseUrl: string;
  private readonly supabaseAnonKey: string;

  constructor() {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be defined');
    }

    this.supabaseUrl = SUPABASE_URL;
    this.supabaseAnonKey = SUPABASE_ANON_KEY;
  }

  private getClient(accessToken?: string): SupabaseClient {
    if (!accessToken) {
      return createClient(this.supabaseUrl, this.supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }

    return createClient(this.supabaseUrl, this.supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async getProfile(
    userId: string,
    email?: string,
    fullName?: string,
    accessToken?: string,
  ): Promise<UserProfile> {
    const client = this.getClient(accessToken);
    const { data, error } = await client
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      this.logger.error(`Error fetching profile: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch profile');
    }

    if (data) {
      return data;
    }

    if (!email) {
      this.logger.warn(`Profile not found for user ${userId}`);
      throw new NotFoundException('Profile not found');
    }

    const insertData = {
      id: userId,
      email,
      full_name: fullName ?? null,
    };

    const { data: created, error: insertError } = await client
      .from('user_profiles')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      this.logger.error(`Error creating profile: ${insertError.message}`);
      throw new InternalServerErrorException('Failed to create profile');
    }

    return created;
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
    email?: string,
    fullName?: string,
    accessToken?: string,
  ): Promise<UserProfile> {
    const client = this.getClient(accessToken);
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (dto.fullName !== undefined) updateData.full_name = dto.fullName;
    if (dto.monthlySalary !== undefined) updateData.monthly_salary = dto.monthlySalary;
    if (dto.salaryDay !== undefined) updateData.salary_day = dto.salaryDay;
    if (dto.currency !== undefined) updateData.currency = dto.currency;

    const { data, error } = await client
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) {
      this.logger.error(`Error updating profile: ${error.message}`);
      throw new InternalServerErrorException('Failed to update profile');
    }

    if (data) {
      return data;
    }

    if (!email) {
      this.logger.warn(`Profile not found for user ${userId} during update`);
      throw new NotFoundException('Profile not found');
    }

    const insertData: Record<string, unknown> = {
      id: userId,
      email,
      full_name: dto.fullName ?? fullName ?? null,
      updated_at: new Date().toISOString(),
    };

    if (dto.monthlySalary !== undefined) insertData.monthly_salary = dto.monthlySalary;
    if (dto.salaryDay !== undefined) insertData.salary_day = dto.salaryDay;
    if (dto.currency !== undefined) insertData.currency = dto.currency;

    const { data: created, error: insertError } = await client
      .from('user_profiles')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      this.logger.error(`Error creating profile during update: ${insertError.message}`);
      throw new InternalServerErrorException('Failed to update profile');
    }

    return created;
  }

  async getFixedExpenses(userId: string, accessToken?: string): Promise<FixedExpense[]> {
    const client = this.getClient(accessToken);
    const { data, error } = await client
      .from('fixed_expenses')
      .select('*')
      .eq('user_id', userId)
      .order('due_day', { ascending: true });

    if (error) {
      this.logger.error(`Error fetching fixed expenses: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch fixed expenses');
    }

    return data ?? [];
  }

  async createFixedExpense(
    userId: string,
    dto: CreateFixedExpenseDto,
    accessToken?: string,
  ): Promise<FixedExpense> {
    const insertData = {
      user_id: userId,
      description: dto.description,
      amount: dto.amount,
      category_id: dto.categoryId ?? null,
      due_day: dto.dueDay ?? 1,
      is_active: dto.isActive ?? true,
    };

    const client = this.getClient(accessToken);
    const { data, error } = await client
      .from('fixed_expenses')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      this.logger.error(`Error creating fixed expense: ${error.message}`);
      throw new InternalServerErrorException('Failed to create fixed expense');
    }

    return data;
  }

  async updateFixedExpense(
    userId: string,
    expenseId: number,
    dto: UpdateFixedExpenseDto,
    accessToken?: string,
  ): Promise<FixedExpense> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.amount !== undefined) updateData.amount = dto.amount;
    if (dto.categoryId !== undefined) updateData.category_id = dto.categoryId;
    if (dto.dueDay !== undefined) updateData.due_day = dto.dueDay;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const client = this.getClient(accessToken);
    const { data, error } = await client
      .from('fixed_expenses')
      .update(updateData)
      .eq('id', expenseId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      this.logger.error(`Error updating fixed expense: ${error.message}`);
      throw new InternalServerErrorException('Failed to update fixed expense');
    }

    if (!data) {
      throw new NotFoundException('Fixed expense not found');
    }

    return data;
  }

  async deleteFixedExpense(userId: string, expenseId: number, accessToken?: string): Promise<void> {
    const client = this.getClient(accessToken);
    const { error } = await client
      .from('fixed_expenses')
      .delete()
      .eq('id', expenseId)
      .eq('user_id', userId);

    if (error) {
      this.logger.error(`Error deleting fixed expense: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete fixed expense');
    }
  }
}
