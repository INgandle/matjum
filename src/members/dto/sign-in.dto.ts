import { IsString, IsNotEmpty } from 'class-validator';

export class SignInDto {
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
