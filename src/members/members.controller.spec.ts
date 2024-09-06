import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from '../auth/auth.service';

import { CreateMemberDto } from './dto/create-member.dto';
import { MemberResponseDto } from './dto/member-response.dto';
import { SignInDto } from './dto/sign-in.dto';
import { UpdateMemberSettingsDto } from './dto/update-member-settings.dto';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

describe('MembersController', () => {
  let controller: MembersController;
  let membersService: MembersService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        {
          provide: MembersService,
          useValue: {
            createMember: jest.fn(),
            findOne: jest.fn(),
            updateSettings: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            signIn: jest.fn(),
            refreshAccessToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MembersController>(MembersController);
    membersService = module.get<MembersService>(MembersService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(membersService).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('createMember', () => {
    it('사용자 회원가입을 진행합니다.(204)', async () => {
      const createMemberDto: CreateMemberDto = {
        accountName: 'testuser',
        password: 'password123',
        name: 'Test User',
      };

      jest.spyOn(membersService, 'createMember').mockResolvedValue();

      const result = await controller.createMember(createMemberDto);

      expect(result).toBeUndefined();
      expect(membersService.createMember).toHaveBeenCalledWith(createMemberDto);
    });
  });

  describe('signIn', () => {
    it('로그인에 성공한다면 access, refresh 토큰 반환합니다.', async () => {
      const signInDto: SignInDto = {
        accountName: 'testuser',
        password: 'password123',
      };

      const mockTokens = {
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      };

      jest.spyOn(authService, 'signIn').mockResolvedValue(mockTokens);

      const result = await controller.signIn(signInDto);

      expect(result).toEqual(mockTokens);
      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
    });
  });

  describe('refreshToken', () => {
    it('새로운 액세스 토큰을 발급합니다.', async () => {
      const mockRequest = {
        user: { userId: '99fde318-0000-4000-8000-000000000000' },
      };

      const mockNewAccessToken = {
        accessToken: 'mockNewAccessToken',
      };

      jest.spyOn(authService, 'refreshAccessToken').mockResolvedValue(mockNewAccessToken);

      const result = await controller.refreshToken(mockRequest);

      expect(result).toEqual(mockNewAccessToken);
      expect(authService.refreshAccessToken).toHaveBeenCalledWith('99fde318-0000-4000-8000-000000000000');
    });
  });

  describe('findOne', () => {
    const memberId = '60b8a1ba-1b9b-45f7-aa58-50d0c87da51f';
    const memberResponseDto = {
      id: memberId,
      accountName: 'accountName',
      name: 'name',
      lat: 37.564084,
      lon: 126.977079,
      isRecommendationEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as MemberResponseDto;

    it('성공적으로 사용자를 찾아 반환', async () => {
      jest.spyOn(membersService, 'findOne').mockResolvedValue(memberResponseDto);

      const result = await controller.findOne(memberId);

      expect(membersService.findOne).toHaveBeenCalledWith(memberId);
      expect(result).toEqual(memberResponseDto);
    });
  });
});
