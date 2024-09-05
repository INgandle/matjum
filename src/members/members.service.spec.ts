import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { Member } from '../entities/member.entity';

import { CreateMemberDto } from './dto/create-member.dto';
import { MembersService } from './members.service';

jest.mock('bcrypt');

describe('MembersService', () => {
  let service: MembersService;
  let mockRepository: Repository<Member>;

  beforeEach(async () => {
    mockRepository = {
      findOneBy: jest.fn(),
      insert: jest.fn(),
    } as unknown as Repository<Member>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: getRepositoryToken(Member),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMember', () => {
    it('회원가입을 진행합니다.', async () => {
      const createMemberDto: CreateMemberDto = {
        accountName: 'testuser',
        name: 'Test User',
        password: 'password123',
      };

      mockRepository.findOneBy = jest.fn().mockResolvedValue(null); // 계정 중복 없음
      mockRepository.insert = jest.fn().mockResolvedValue({}); // 삽입 성공
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      await expect(service.createMember(createMemberDto)).resolves.not.toThrow();

      // findOneBy가 호출되었는지 확인
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ accountName: 'testuser' });

      // bcrypt.hash가 올바른 인자로 호출되었는지 확인
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', expect.any(Number));

      // insert가 호출되었는지 확인
      expect(mockRepository.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          accountName: 'testuser',
          name: 'Test User',
          password: 'hashedPassword', // 암호화된 비밀번호 확인
        }),
      );
    });

    it('이미 존재하는 사용자의 계정이라면 conflict error 반환합니다.', async () => {
      const createMemberDto: CreateMemberDto = {
        accountName: 'existinguser',
        name: 'Existing User',
        password: 'password123',
      };

      mockRepository.findOneBy = jest.fn().mockResolvedValue({ id: 1, accountName: 'existinguser' });

      // ConflictException 테스트
      await expect(service.createMember(createMemberDto)).rejects.toThrow(ConflictException);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ accountName: 'existinguser' });
      expect(mockRepository.insert).not.toHaveBeenCalled();
    });
  });
});
