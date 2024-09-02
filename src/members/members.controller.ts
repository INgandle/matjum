import { Controller, Get, Body, Patch, Param, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { MemberResponseDto } from './dto/member-response.dto';
import { UpdateMemberSettingsDto } from './dto/update-member-settings.dto';
import { MembersService } from './members.service';

@ApiTags('members')
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

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
