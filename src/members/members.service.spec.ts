import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Point, Repository } from 'typeorm';

import { Member } from '../entities/member.entity';

import { CreateMemberDto } from './dto/create-member.dto';
import { MemberResponseDto } from './dto/member-response.dto';
import { UpdateMemberSettingsDto } from './dto/update-member-settings.dto';
import { MembersService } from './members.service';

jest.mock('bcrypt');

describe('MembersService', () => {
  let service: MembersService;
  let mockRepository: Repository<Member>;

  beforeEach(async () => {
    mockRepository = {
      findOneBy: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
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

  describe('findOne', () => {
    const memberId = '60b8a1ba-1b9b-45f7-aa58-50d0c87da51f';
    const member = {
      id: memberId,
      accountName: 'accountName',
      name: 'name',
      password: 'hashedPassword',
      location: { type: 'Point', coordinates: [37.564084, 126.977079] } as Point,
      isRecommendationEnabled: true,
      reviews: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Member;
    const memberResponseDto = {
      id: member.id,
      accountName: member.accountName,
      name: member.name,
      lat: member.location.coordinates[0],
      lon: member.location.coordinates[1],
      isRecommendationEnabled: member.isRecommendationEnabled,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    } as MemberResponseDto;

    it('성공적으로 한 사용자를 찾아 반환', async () => {
      jest.spyOn(mockRepository, 'findOneBy').mockResolvedValue(member);

      const result = await service.findOne(memberId);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: memberId });
      expect(result).toEqual(memberResponseDto);
    });

    it('사용자의 위도, 경도 정보가 없는 경우 null로 반환', async () => {
      member.location = null;
      memberResponseDto.lat = null;
      memberResponseDto.lon = null;

      jest.spyOn(mockRepository, 'findOneBy').mockResolvedValue(member);

      const result = await service.findOne(memberId);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: memberId });
      expect(result).toEqual(memberResponseDto);
    });

    it('사용자가 존재하지 않을 경우 404', async () => {
      jest.spyOn(mockRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOne(memberId)).rejects.toThrow(NotFoundException);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: memberId });
    });
  });

  describe('updateSettings', () => {
    const memberId = '60b8a1ba-1b9b-45f7-aa58-50d0c87da51f';
    const updateMemberSettingsDto = {
      lat: 37.564084,
      lon: 126.977079,
      isRecommendationEnabled: true,
    } as UpdateMemberSettingsDto;
    const member = {
      id: memberId,
    } as unknown as Member;

    it('성공적으로 사용자 설정 업데이트', async () => {
      jest.spyOn(mockRepository, 'findOneBy').mockResolvedValue(member);
      const updateSpy = jest.spyOn(mockRepository, 'update').mockResolvedValue(undefined);

      const result = await service.updateSettings(memberId, updateMemberSettingsDto);
      const locationFunc = updateSpy.mock.calls[0][1].location as () => string;

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: memberId });
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: memberId },
        {
          location: expect.any(Function),
          isRecommendationEnabled: updateMemberSettingsDto.isRecommendationEnabled,
        },
      );
      expect(locationFunc()).toBe(
        `ST_SetSRID(ST_MakePoint(${updateMemberSettingsDto.lon}, ${updateMemberSettingsDto.lat}),4326)`,
      );
      expect(result).toBeUndefined();
    });

    it('사용자가 존재하지 않을 경우 404', async () => {
      jest.spyOn(mockRepository, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(mockRepository, 'update').mockResolvedValue(undefined);

      await expect(service.updateSettings(memberId, updateMemberSettingsDto)).rejects.toThrow(NotFoundException);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: memberId });
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });
});
