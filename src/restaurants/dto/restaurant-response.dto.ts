import { OmitType } from '@nestjs/swagger';

import { Restaurant } from '../../entities/restaurant.entity';
import { Review } from '../../entities/review.entity';

class ReviewResponseDto extends OmitType(Review, ['member', 'createdAt', 'updatedAt', 'restaurant']) {}

export class RestaurantResponseDto extends OmitType(Restaurant, ['reviews', 'createdAt', 'updatedAt', 'location']) {
  readonly lon: number;
  readonly lat: number;
  readonly reviews?: ReviewResponseDto[];
  readonly distance?: number;
}
