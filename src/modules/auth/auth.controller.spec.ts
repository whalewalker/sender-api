import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthResponse, UserResponse } from './dto/auth-response.dto';

const mockUserResponse: UserResponse = {
  id: 'user-id-1',
  email: 'test@example.com',
  name: 'Test User',
  plan: 'free',
  industry: null,
  onboarded: false,
  createdAt: new Date('2024-01-01'),
};

const mockAuthResponse: AuthResponse = {
  accessToken: 'mock_token',
  tokenType: 'bearer',
  user: mockUserResponse,
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            googleLogin: jest.fn(),
            formatUserResponse: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:5173/auth/callback'),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService) as jest.Mocked<AuthService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    it('should return 201 and AuthResponse on valid input', async () => {
      authService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      } as any);

      expect(result.data.accessToken).toBeDefined();
    });

    it('should propagate ConflictException from service', async () => {
      authService.register.mockRejectedValue(
        new ConflictException('Email already registered'),
      );

      await expect(
        controller.register({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123',
        } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('POST /login', () => {
    it('should return AuthResponse on valid credentials', async () => {
      authService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login({
        email: 'test@example.com',
        password: 'password123',
      } as any);

      expect(result.data.accessToken).toBeDefined();
    });

    it('should propagate UnauthorizedException from service', async () => {
      authService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(
        controller.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        } as any),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('GET /me', () => {
    it('should return the current user', () => {
      authService.formatUserResponse.mockReturnValue(mockUserResponse);

      const mockRequest = { user: {} };
      const result = controller.getMe(mockRequest);

      expect(result.data).toEqual(mockUserResponse);
    });
  });

  describe('GET /google/callback', () => {
    it('should redirect to frontend with token after Google OAuth', async () => {
      authService.googleLogin.mockResolvedValue(mockAuthResponse);

      const mockRequest = { user: {} };
      const result = await controller.googleCallback(mockRequest);

      expect(result.url).toContain('mock_token');
      expect(result.url).toContain('http://localhost:5173/auth/callback');
    });
  });
});
