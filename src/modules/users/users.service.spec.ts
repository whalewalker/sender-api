import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

const mockUser = {
  _id: 'user-id-1',
  email: 'test@test.com',
  name: 'Test User',
  hashedPassword: 'hashed',
  plan: 'free',
  onboarded: false,
};

const mockUserModel = jest.fn().mockImplementation(() => ({
  save: jest.fn().mockResolvedValue(mockUser),
})) as any;

mockUserModel.findOne = jest.fn();
mockUserModel.findById = jest.fn();
mockUserModel.findByIdAndUpdate = jest.fn();

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByEmail('test@test.com');

      expect(result).toBeDefined();
      expect(result?.email).toBe('test@test.com');
    });

    it('should return null when user not found', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findByEmail('notfound@test.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findById('user-id-1');

      expect(result).toBeDefined();
      expect(result?._id).toBe('user-id-1');
    });

    it('should return null when user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const saveMock = jest.fn().mockResolvedValue(mockUser);
      mockUserModel.mockImplementation(() => ({ save: saveMock }));

      const result = await service.create({
        email: 'test@test.com',
        name: 'Test User',
        hashedPassword: 'hashed',
      });

      expect(saveMock).toHaveBeenCalled();
      expect(result.email).toBe('test@test.com');
    });
  });

  describe('findOrCreateGoogleUser', () => {
    it('should return existing user when found by googleId', async () => {
      mockUserModel.findOne
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockUser),
          }),
        });

      const result = await service.findOrCreateGoogleUser({
        googleId: 'google-123',
        email: 'test@test.com',
        name: 'Test User',
      });

      expect(result).toEqual(mockUser);
    });

    it('should link googleId to an existing email user', async () => {
      const linked = { ...mockUser, googleId: 'google-123' };
      mockUserModel.findOne
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(mockUser),
        });
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(linked),
      });

      const result = await service.findOrCreateGoogleUser({
        googleId: 'google-123',
        email: 'test@test.com',
        name: 'Test User',
      });

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user-id-1',
        { googleId: 'google-123' },
        { new: true },
      );
      expect(result.googleId).toBe('google-123');
    });

    it('should create a new user when no match is found', async () => {
      const newUser = { ...mockUser, googleId: 'google-123', hashedPassword: undefined };
      const saveMock = jest.fn().mockResolvedValue(newUser);
      mockUserModel.findOne
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(null),
        });
      mockUserModel.mockImplementation(() => ({ save: saveMock }));

      const result = await service.findOrCreateGoogleUser({
        googleId: 'google-123',
        email: 'new@test.com',
        name: 'New User',
      });

      expect(saveMock).toHaveBeenCalled();
      expect(result.googleId).toBe('google-123');
    });
  });

  describe('markOnboarded', () => {
    it('should set onboarded to true and save', async () => {
      const updatedUser = { ...mockUser, onboarded: true };
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedUser),
      });

      const result = await service.markOnboarded('user-id-1');

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user-id-1',
        { onboarded: true },
        { new: true },
      );
      expect(result?.onboarded).toBe(true);
    });
  });
});
