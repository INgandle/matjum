import { Type } from 'class-transformer';
import { IsEnum, IsLatitude, IsLongitude, IsNumber, IsOptional } from 'class-validator';

export enum OrderBy {
  DISTANCE = 'distance',
  RATING = 'rating',
}

export enum SortBy {
  DESC = 'DESC',
  ASC = 'ASC',
}

export class RestaurantQueryDto {
  /**
   * 경도
   * @example 126.9530
   */
  @IsLongitude()
  @Type(() => Number)
  readonly lon: number;

  /**
   * 위도
   * @example 37.5616
   */
  @IsLatitude()
  @Type(() => Number)
  readonly lat: number;

  /**
   * 범위
   * @example 200000
   */
  @IsNumber()
  @Type(() => Number)
  readonly range: number;

  @IsEnum(OrderBy)
  @IsOptional()
  readonly orderBy?: OrderBy = OrderBy.RATING;

  @IsEnum(SortBy)
  @IsOptional()
  readonly sortBy?: 'DESC' | 'ASC' = SortBy.DESC;

  @IsNumber()
  @IsOptional()
  readonly pageSize?: number = 10;

  @IsNumber()
  @IsOptional()
  readonly page?: number = 0;
}
