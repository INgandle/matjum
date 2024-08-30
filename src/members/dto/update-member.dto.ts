import { IsBoolean, IsLatitude, IsLongitude, IsNotEmpty } from 'class-validator';

export class UpdateMemberDto {
  @IsLatitude()
  @IsNotEmpty()
  lat: number;

  @IsLongitude()
  @IsNotEmpty()
  lon: number;

  @IsBoolean()
  @IsNotEmpty()
  isRecommendationEnabled: boolean;
}
