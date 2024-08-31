import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

enum OrderBy {
  DISTANCE = 'distance',
  RATING = 'rating',
}

enum SortBy {
  DESC = 'DESC',
  ASC = 'ASC',
}

export class RestaurantQueryDto {
  @IsNumber()
  @Type(() => Number)
  readonly lon: number;

  @IsNumber()
  @Type(() => Number)
  readonly lat: number;

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
