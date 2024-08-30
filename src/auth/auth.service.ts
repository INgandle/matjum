import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { Member } from '../entities/member.entity';
import { SignInDto } from '../members/dto/sign-in.dto';

import { JWT_REFRESH_EXPIRES_IN } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private jwtService: JwtService,
    private configService: ConfigService,
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
      select: ['id', 'accountName', 'password'], // 비밀번호 필드를 명시적으로 포함시킴
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
    const payload = { sub: member.id, accountName: member.accountName };

    // 액세스 토큰 생성
    const accessToken = this.jwtService.sign(payload);

    // 리프레시 토큰 생성
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    });

    // TODO ) 리프레시 토큰 레디스 저장

    return { accessToken, refreshToken };
  }
}
