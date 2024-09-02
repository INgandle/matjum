import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';

import { Member } from '../entities/member.entity';
import { SignInDto } from '../members/dto/sign-in.dto';

import { JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * 로그인
   * @param signInDto
   * @returns accessToken, refreshToken
   */
  async signIn(signInDto: SignInDto): Promise<{ accessToken: string; refreshToken: string }> {
    const { accountName, password } = signInDto;

    //사용자 검증 => 공격자에게 추가 정보를 제공하지 않기위해 401 상태 코드 반환
    const member = await this.memberRepository.findOne({
      where: { accountName },
      select: ['id', 'accountName', 'password', 'name'], // 비밀번호 필드를 명시적으로 포함시킴
    });

    if (member === null) {
      throw new UnauthorizedException('Invalid credentials');
    }

    //비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, member.password);
    if (isPasswordValid == false) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 토큰 페이로드 설정
    const payload = { sub: member.id, accountName: member.accountName, name: member.name };

    // 액세스 토큰 생성
    const accessToken = this.jwtService.sign(payload);

    // 리프레시 토큰 생성
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    });

    //리프레시 토큰 레디스에 저장
    //key: refresh_token:member.id, value: jwt 토큰 문자열
    await this.cacheManager.set(`refresh_token:${member.id}`, refreshToken);

    return { accessToken, refreshToken };
  }

  /**
   * 리프레쉬 토큰이 유효하면 새로운 액세스 토큰을 발급합니다.
   * @returns accessToken
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const storedToken = await this.cacheManager.get(`refresh_token:${payload.sub}`);

      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = { sub: payload.sub, accountName: payload.accountName, name: payload.name };
      const accessToken = this.jwtService.sign(newPayload, { expiresIn: JWT_ACCESS_EXPIRES_IN });

      return { accessToken };
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
