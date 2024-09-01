import { IsByteLength, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class CreateReviewDto {
  // 입력된 문자열의 바이트 수가 범위 안에 해당하는지 확인하는 데코레이터로, @IsString 검증도 함께함
  @IsByteLength(10, 255)
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;
}
