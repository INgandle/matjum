import { OmitType } from '@nestjs/swagger';

import { Member } from '../../entities/member.entity';

export class MemberResponseDto extends OmitType(Member, ['password', 'reviews', 'location']) {
  lon: number;
  lat: number;
}
