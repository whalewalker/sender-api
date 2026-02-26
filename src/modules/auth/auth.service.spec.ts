import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt');

const mockUser = {
  _id: { toString: () => 'user-id-1' },
  email: 'test@example.com',
  name: 'Test User',
  hashedPassword: 'hashed_password',
  plan: 'free',
  industry: null,
  onboarded: false,
  createdAt: new Date('2024-01-01'),
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findByEmailWithPassword: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);

      await expect(
        service.register({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123',
        }),
      ).rejects.toThrow(new ConflictException('Email already registered'));
    });

    it('should hash the password before saving', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      usersService.create.mockResolvedValue(mockUser as any);
      jwtService.signAsync.mockResolvedValue('mock_token');

      await service.register({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('should return AuthResponse with token and user on success', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      usersService.create.mockResolvedValue(mockUser as any);
      jwtService.signAsync.mockResolvedValue('mock_token');

      const result = await service.register({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });

      expect(result.accessToken).toBe('mock_token');
      expect(result.user.email).toBe('test@example.com');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        service.login({ email: 'notfound@example.com', password: 'password123' }),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });

    it('should return AuthResponse on valid credentials', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('valid_token');

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('valid_token');
      expect(result.user.email).toBe('test@example.com');
    });
  });

  describe('googleLogin', () => {
    it('should return AuthResponse for a Google-authenticated user', async () => {
      jwtService.signAsync.mockResolvedValue('google_token');

      const result = await service.googleLogin(mockUser as any);

      expect(result.accessToken).toBe('google_token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.tokenType).toBe('bearer');
    });
  });

  describe('validateToken', () => {
    it('should return user when token payload is valid', async () => {
      usersService.findById.mockResolvedValue(mockUser as any);

      const result = await service.validateToken({ sub: 'user-id-1' });

      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      const result = await service.validateToken({ sub: 'nonexistent-id' });

      expect(result).toBeNull();
    });
  });
});
