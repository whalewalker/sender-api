import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse, UserResponse } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  formatUserResponse(user: UserDocument): UserResponse {
    return {
      id: (user._id as { toString(): string }).toString(),
      email: user.email,
      name: user.name,
      plan: user.plan,
      industry: user.industry ?? null,
      onboarded: user.onboarded,
      createdAt: user.createdAt,
    };
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      hashedPassword: hash,
    });

    const accessToken = await this.jwtService.signAsync({
      sub: (user._id as { toString(): string }).toString(),
      email: user.email,
    });

    return {
      accessToken,
      tokenType: 'bearer',
      user: this.formatUserResponse(user),
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.hashedPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const match = await bcrypt.compare(dto.password, user.hashedPassword);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: (user._id as { toString(): string }).toString(),
      email: user.email,
    });

    return {
      accessToken,
      tokenType: 'bearer',
      user: this.formatUserResponse(user),
    };
  }

  async validateToken(payload: { sub: string }): Promise<UserDocument | null> {
    return this.usersService.findById(payload.sub);
  }

  async googleLogin(user: UserDocument): Promise<AuthResponse> {
    const accessToken = await this.jwtService.signAsync({
      sub: (user._id as { toString(): string }).toString(),
      email: user.email,
    });

    return {
      accessToken,
      tokenType: 'bearer',
      user: this.formatUserResponse(user),
    };
  }
}
