import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { Member } from '../entities/member.entity';
import { SignInDto } from '../members/dto/sign-in.dto';

import { AuthService } from './auth.service';
describe('AuthService', () => {
  let authService: AuthService;
  let mockMemberRepository;
  let mockJwtService;
  let mockConfigService;
  let mockCacheManager;

  beforeEach(async () => {
    mockMemberRepository = {
      findOne: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn(),
    };

    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Member),
          useValue: mockMemberRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('signIn', () => {
    it('성공하면 액세스, 리프레쉬 토큰 반환합니다.', async () => {
      const signInDto: SignInDto = {
        accountName: 'testuser',
        password: 'password123',
      };

      const mockMember = {
        id: '99fde318-0000-4000-8000-000000000000',
        accountName: 'testuser',
        password: await bcrypt.hash('password123', 10),
        name: 'Test User',
      };

      mockMemberRepository.findOne.mockResolvedValue(mockMember);
      mockJwtService.sign.mockReturnValueOnce('mockedAccessToken');
      mockJwtService.sign.mockReturnValueOnce('mockedRefreshToken');
      mockConfigService.get.mockReturnValue('refreshSecret');

      const result = await authService.signIn(signInDto);

      expect(result).toEqual({
        accessToken: 'mockedAccessToken',
        refreshToken: 'mockedRefreshToken',
      });
      expect(mockCacheManager.set).toHaveBeenCalledWith(`refresh_token:${mockMember.id}`, 'mockedRefreshToken');
    });

    it('틀린 비밀번호이면 에러 반환', async () => {
      const signInDto: SignInDto = {
        accountName: 'testuser',
        password: 'wrongpassword',
      };

      mockMemberRepository.findOne.mockResolvedValue(null);

      await expect(authService.signIn(signInDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validate RefreshToken', () => {
    it('유효한 리프레쉬 토큰이라면 true를 반환합니다.', async () => {
      const userId = '99fde318-0000-4000-8000-000000000000';
      const refreshToken = 'validRefreshToken';

      mockCacheManager.get.mockResolvedValue(refreshToken);

      const result = await authService.validateRefreshToken(userId, refreshToken);

      expect(result).toBe(true);
    });

    it('유효하지 않은 리프레쉬 토큰이라면 false를 반환합니다.', async () => {
      const userId = '99fde318-0000-4000-8000-000000000000';
      const refreshToken = 'invalidRefreshToken';

      mockCacheManager.get.mockResolvedValue('differentToken');

      const result = await authService.validateRefreshToken(userId, refreshToken);

      expect(result).toBe(false);
    });
  });

  describe('refreshAccessToken', () => {
    it('새로운 액세스 토큰을 반환합니다.', async () => {
      const userId = '99fde318-0000-4000-8000-000000000000';
      const mockMember = {
        id: '99fde318-0000-4000-8000-000000000000',
        accountName: 'testuser',
        name: 'Test User',
      };

      mockMemberRepository.findOne.mockResolvedValue(mockMember);
      mockJwtService.sign.mockReturnValue('accessToken');

      const result = await authService.refreshAccessToken(userId);

      expect(result).toEqual({ accessToken: 'accessToken' });
    });

    it('존재하지 않은 사용자인 경우에는 401에러를 반환합니다.', async () => {
      const userId = 'nonexistent';

      mockMemberRepository.findOne.mockResolvedValue(null);

      await expect(authService.refreshAccessToken(userId)).rejects.toThrow(UnauthorizedException);
    });
  });
});
