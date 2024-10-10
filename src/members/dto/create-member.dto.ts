import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 회원가입용 DTO
 */
export class CreateMemberDto {
  @IsNotEmpty()
  @IsString()
  accountName: string; //계정명

  @IsNotEmpty()
  @IsString()
  name: string; //이름

  @IsNotEmpty()
  @IsString()
  password: string;
}
