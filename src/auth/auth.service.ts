import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

dotenv.config();

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
}

export interface AuthResponse {
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  requiresEmailConfirmation?: boolean;
  message?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly supabase: SupabaseClient;

  constructor() {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be defined');
    }

    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  async signUp(dto: SignUpDto): Promise<AuthResponse> {
    const { data, error } = await this.supabase.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: {
        data: {
          full_name: dto.fullName || '',
        },
      },
    });

    if (error) {
      this.logger.error(`Sign up error: ${error.message}`);
      throw new BadRequestException(error.message);
    }

    if (!data.user) {
      this.logger.warn('Sign up returned no user; treating as pending confirmation.');
      return {
        requiresEmailConfirmation: true,
        message:
          'Revisa tu correo para confirmar tu cuenta. Si el correo ya existe, intenta iniciar sesion.',
      };
    }

    if (!data.session) {
      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
          fullName: data.user.user_metadata?.full_name,
        },
        requiresEmailConfirmation: true,
        message: 'Revisa tu correo para confirmar tu cuenta antes de iniciar sesion.',
      };
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        fullName: data.user.user_metadata?.full_name,
      },
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async signIn(dto: SignInDto): Promise<AuthResponse> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      this.logger.error(`Sign in error: ${error.message}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!data.user || !data.session) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        fullName: data.user.user_metadata?.full_name,
      },
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      this.logger.error(`Refresh token error: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!data.user || !data.session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        fullName: data.user.user_metadata?.full_name,
      },
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async verifyToken(token: string): Promise<User> {
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      this.logger.error(`Token verification error: ${error?.message || 'No user found'}`);
      throw new UnauthorizedException('Invalid or expired token');
    }

    return data.user;
  }

  async signOut(token: string): Promise<void> {
    // Set the session with the token to sign out
    await this.supabase.auth.setSession({
      access_token: token,
      refresh_token: '',
    });

    const { error } = await this.supabase.auth.signOut();

    if (error) {
      this.logger.error(`Sign out error: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }
}
