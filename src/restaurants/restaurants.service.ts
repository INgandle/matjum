import { ConflictException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { Repository } from 'typeorm';

import { Restaurant } from '../entities/restaurant.entity';
import { Review } from '../entities/review.entity';

import { CreateReviewDto } from './dto/create-review.dto';
import { RestaurantQueryDto } from './dto/restaurant-query.dto';
import { RestaurantResponseDto } from './dto/restaurant-response.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Review) private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Restaurant) private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  /**
   * 사용자가 특정 맛집에 리뷰를 생성합니다. 리뷰가 생성되면 해당 맛집의 평점을 업데이트 합니다.
   * @param createReviewDto 생성할 리뷰의 내용, 평점
   * @param restaurantId 리뷰를 생성할 맛집의 PK
   * @param memberId 리뷰를 생성하는 사용자의 PK
   * @returns 생성된 리뷰의 id
   */
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
      throw new ConflictException('Already reviewed');
    }
  }

  // 맛집의 모든 리뷰 기록을 조회하고, 평균을 계산하여 평점을 업데이트 합니다.
  private async updateRestaurantRating(id: string): Promise<void> {
    const averageOfRatings = await this.reviewRepository.average('rating', { restaurantId: id });
    // 소수점 한 자리까지만 나오도록
    const updatedRating = +averageOfRatings.toFixed(1);

    this.restaurantRepository.update({ id }, { rating: updatedRating });
  }

  /*
   * 특정 위치를 기준으로 일정 거리 안에 있는 맛집들을 조회합니다.
   * @param options 검색 조건
   * @returns 맛집 배열
   */
  async findList(options: RestaurantQueryDto): Promise<RestaurantResponseDto[]> {
    const result = await this.restaurantRepository
      .createQueryBuilder()
      .select([
        'id',
        'name',
        'address',
        'phone_number',
        'category',
        'rating',
        `ST_X(location) as lat`,
        `ST_Y(location) as lon`,
        `ST_Distance(ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, r.location::geography) as distance`,
      ])
      .where(`ST_DWithin(ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, r.location::geography, :range)`, {
        lon: options.lon,
        lat: options.lat,
        range: options.range,
      })
      .orderBy(options.orderBy, options.sortBy)
      .skip(options.page * options.pageSize)
      .take(options.pageSize)
      .getRawMany();

    return result;
  }

  /**
   * 맛집id를 통해 맛집의 상세 정보를 조회합니다.
   * @param id 맛집 id
   * @returns 리뷰를 포함한 맛집 정보
   */
  async findOneDetail(id: string): Promise<RestaurantResponseDto | null> {
    if (isUUID(id) === false) {
      throw new BadRequestException('Invalid id');
    }

    const result = await this.restaurantRepository
      .createQueryBuilder('r')
      .select([
        'r.id as id',
        'name as name',
        'address',
        'phone_number',
        'category',
        'r.rating as rating',
        `ST_X(location) as lat`,
        `ST_Y(location) as lon`,
        `json_agg(json_build_object('id', review.id, 'content', review.content, 'rating', review.rating)) as reviews`,
      ])
      .leftJoin('r.reviews', 'review')
      .where('r.id = :id', { id })
      .groupBy('r.id')
      .getRawOne();

    if (result === null) {
      throw new NotFoundException('Restaurant not found');
    }

    return result;
  }
}
