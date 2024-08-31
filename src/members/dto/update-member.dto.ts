import { IsBoolean, IsLatitude, IsLongitude, IsNotEmpty } from 'class-validator';

export class UpdateMemberDto {
  /**
   * 사용자의 위도
   * @example 37.564625
   */
  @IsLatitude()
  @IsNotEmpty()
  lat: number;

  /**
   * 사용자의 경도
   * @example 126.977260
   */
  @IsLongitude()
  @IsNotEmpty()
  lon: number;

  /**
   * 추천 기능 사용 여부
   * @example true
   */
  @IsBoolean()
  @IsNotEmpty()
  isRecommendationEnabled: boolean;
}
