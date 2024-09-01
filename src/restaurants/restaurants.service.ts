import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Restaurant } from '../entities/restaurant.entity';
import { Review } from '../entities/review.entity';

import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Review) private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Restaurant) private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  async createReview(
    createReviewDto: CreateReviewDto,
    restaurantId: string,
    memberId: string,
  ): Promise<{ id: string }> {
    const { content, rating } = createReviewDto;

    // 맛집 not found 예외처리
    await this.findRestaurantById(restaurantId);
    // 이미 리뷰를 작성한 경우에 대한 예외처리
    await this.isAlreadyReviewd(memberId, restaurantId);

    const insertResult = await this.reviewRepository.insert({ content, rating, restaurantId, memberId });
    this.updateRestaurantRating(restaurantId);

    return { id: insertResult.identifiers[0].id };
  }

  // 전달 받은 id 인자로 맛집을 찾아 반환합니다. 존재하지 않는 맛집이라면 에러를 발생시킵니다.
  private async findRestaurantById(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOneBy({ id });

    if (restaurant === null) {
      throw new NotFoundException('Restaurant not found');
    }

    return restaurant;
  }

  // 사용자가 이미 해당 맛집에 리뷰를 작성했는지 확인하고, 이미 작성했다면 에러를 발생시킵니다.
  private async isAlreadyReviewd(memberId: string, restaurantId: string): Promise<void> {
    const review = await this.reviewRepository.findOneBy({ memberId, restaurantId });

    if (review !== null) {
      throw new ConflictException('already reviewd');
    }
  }

  // 맛집의 모든 리뷰 기록을 조회하고, 평균을 계산하여 평점을 업데이트 합니다.
  private async updateRestaurantRating(id: string): Promise<void> {
    const { sum, count } = (
      await this.reviewRepository
        .createQueryBuilder('review')
        .select('COUNT(*) as count, SUM(rating) as sum')
        .where('review.restaurantId = :id', { id })
        .groupBy('review.restaurantId')
        .execute()
    )[0];

    // 소수점 한 자리까지만 나오도록
    const updatedRating = (sum / count).toFixed(1);
    this.restaurantRepository.update({ id: id }, { rating: +updatedRating });
  }
}
