import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse, UserResponse } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ApiResponse } from '../../common/dto/api-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from '../users/schemas/user.schema';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ type: ApiResponse<AuthResponse> })
  @ApiConflictResponse({ description: 'Email already registered' })
  async register(@Body() dto: RegisterDto): Promise<ApiResponse<AuthResponse>> {
    return ApiResponse.success(await this.authService.register(dto));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiOkResponse({ type: ApiResponse<AuthResponse> })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<ApiResponse<AuthResponse>> {
    return ApiResponse.success(await this.authService.login(dto));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiOkResponse({ type: ApiResponse<UserResponse> })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  getMe(@CurrentUser() user: UserDocument): ApiResponse<UserResponse> {
    return ApiResponse.success(this.authService.formatUserResponse(user));
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  googleLogin(): void {
    // Passport redirects to Google — no body needed
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @Redirect()
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(
    @CurrentUser() user: UserDocument,
  ): Promise<{ url: string }> {
    const { accessToken } = await this.authService.googleLogin(user);
    const redirectUrl =
      this.configService.get<string>('google.redirectUrl') ??
      'http://localhost:5173/auth/callback';
    return { url: `${redirectUrl}?token=${accessToken}` };
  }
}
