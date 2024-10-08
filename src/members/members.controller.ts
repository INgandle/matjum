import { Controller, Get, Post, Body, Patch, Param, HttpStatus, HttpCode, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from '../auth/auth.service';
import { Public } from '../auth/decorators/public.decorator';
import { RefreshAuth } from '../auth/decorators/refresh-auth.decorator';

import { CreateMemberDto } from './dto/create-member.dto';
import { MemberResponseDto } from './dto/member-response.dto';
import { SignInDto } from './dto/sign-in.dto';
import { UpdateMemberSettingsDto } from './dto/update-member-settings.dto';
import { MembersService } from './members.service';

@ApiTags('members')
@Controller('members')
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
    private readonly authService: AuthService,
  ) {}

  /**
   * 회원가입 API
   * @param createMemberDto
   * @returns
   */
  @Public()
  @Post('sign-up')
  @HttpCode(HttpStatus.NO_CONTENT) // 성공 204
  async createMember(@Body() createMemberDto: CreateMemberDto): Promise<void> {
    return this.membersService.createMember(createMemberDto);
  }

  /**
   * 로그인 API
   * @param signInDto
   * @returns
   */
  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() signInDto: SignInDto): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.signIn(signInDto);
  }

  /**
   * 새로운 액세스 토큰 발급 API
   * @param req
   * @returns
   */
  @RefreshAuth()
  @Post('auth/refresh')
  async refreshToken(@Request() req): Promise<{ accessToken: string }> {
    const { userId } = req.user;
    return await this.authService.refreshAccessToken(userId);
  }
  /**
   * 사용자 정보 조회 API
   * @param id 사용자 PK
   * @returns 패스워드를 제외한 모든 사용자 정보
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MemberResponseDto> {
    return await this.membersService.findOne(id);
  }

  /**
   * 사용자 설정 업데이트 API
   * @param id 사용자 PK
   * @param UpdateMemberSettingsDto 업데이트 할 정보
   */
  @Patch(':id/settings')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateSettings(@Param('id') id: string, @Body() updateMemberSettingsDto: UpdateMemberSettingsDto): void {
    this.membersService.updateSettings(id, updateMemberSettingsDto);
  }
}
