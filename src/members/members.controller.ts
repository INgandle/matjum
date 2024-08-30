import { Controller, Get, Body, Patch, Param, HttpStatus, HttpCode } from '@nestjs/common';

import { MemberResponseDto } from './dto/member-response.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MembersService } from './members.service';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MemberResponseDto> {
    return await this.membersService.findOne(id);
  }

  @Patch(':id/settings')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateSettings(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto): void {
    this.membersService.updateSettings(id, updateMemberDto);
  }
}
