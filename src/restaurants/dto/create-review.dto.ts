import { IsByteLength, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class CreateReviewDto {
  /**
   * 리뷰 내용
   * @example "너무너무 맛있어요!"
   */
  @IsByteLength(10, 255) // 입력된 문자열의 바이트 수 범위 확인 데코레이터로, @IsString 검증도 함께함
  @IsNotEmpty()
  content: string;

  /**
   * 리뷰 평점
   * @example 5
   */
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;
}
