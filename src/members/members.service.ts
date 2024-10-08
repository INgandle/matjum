import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { Member } from '../entities/member.entity';

import { CreateMemberDto } from './dto/create-member.dto';
import { MemberResponseDto } from './dto/member-response.dto';
import { UpdateMemberSettingsDto } from './dto/update-member-settings.dto';
import { SALT_ROUNDS } from './member.constants';

@Injectable()
export class MembersService {
  constructor(@InjectRepository(Member) private readonly memberRepository: Repository<Member>) {}

  /**
   * 회원가입
   * @param createMemberDto
   */
  async createMember(createMemberDto: CreateMemberDto): Promise<void> {
    const { accountName, name, password } = createMemberDto;

    //계정명 중복 확인
    const existingMember = await this.memberRepository.findOneBy({ accountName });

    if (existingMember) {
      throw new ConflictException('Account name already exists');
    }

    //비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    //회원 데이터 insert
    await this.memberRepository.insert({
      accountName,
      name,
      password: hashedPassword,
    });
  }

  /**
   * id 경로 변수로 사용자를 찾아 반환합니다.
   * @param id 사용자 PK
   * @returns 패스워드를 제외한 모든 사용자 정보
   */
  async findOne(id: string): Promise<MemberResponseDto> {
    const member = await this.findMemberById(id);
    const [lat, lon] = member.location?.coordinates || [null, null];

    return {
      id: member.id,
      accountName: member.accountName,
      name: member.name,
      lat,
      lon,
      isRecommendationEnabled: member.isRecommendationEnabled,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  }

  /**
   * 사용자의 위도, 경도, 추천 기능 사용 여부를 업데이트 합니다.
   * @param id 사용자 PK
   * @param updateMemberDto 업데이트 할 정보
   */
  async updateSettings(id: string, updateMemberSettingsDto: UpdateMemberSettingsDto): Promise<void> {
    const { lon, lat, isRecommendationEnabled } = updateMemberSettingsDto;

    // 사용자 not found 예외처리
    await this.findMemberById(id);

    this.memberRepository.update(
      { id },
      { location: () => `ST_SetSRID(ST_MakePoint(${lon}, ${lat}),4326)`, isRecommendationEnabled },
    );
  }

  // 전달 받은 id 인자로 사용자를 찾아 반환합니다. 존재하지 않는 사용자라면 에러를 발생시킵니다.
  private async findMemberById(id: string): Promise<Member> {
    const member = await this.memberRepository.findOneBy({ id });

    if (member === null) {
      throw new NotFoundException('member not found');
    }

    return member;
  }
}
