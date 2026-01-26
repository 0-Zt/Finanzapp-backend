import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Crear cuenta (signup)' })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({ status: 201, description: 'Usuario creado o pendiente de confirmación.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos / error de signup.' })
  async signUp(@Body() dto: SignUpDto) {
    return await this.authService.signUp(dto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión (signin)' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({ status: 200, description: 'Autenticación OK. Devuelve tokens.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async signIn(@Body() dto: SignInDto) {
    return await this.authService.signIn(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar sesión (refresh token)' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Tokens renovados.' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido.' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return await this.authService.refreshToken(dto.refreshToken);
  }
}
