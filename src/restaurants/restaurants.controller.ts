import { Controller, Post, Body, Param, Res, HttpStatus, Req, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { Member } from '../entities/member.entity';
import { Restaurant } from '../entities/restaurant.entity';

import { CreateReviewDto } from './dto/create-review.dto';
import { RestaurantQueryDto } from './dto/restaurant-query.dto';
import { RestaurantResponseDto } from './dto/restaurant-response.dto';
import { RestaurantsService } from './restaurants.service';

export type MemberRequest = Request & {
  member: Member;
};

@Controller('restaurants')
@ApiTags('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  /**
   * 리뷰 생성 API
   * @param createReviewDto 생성할 리뷰의 내용, 평점
   * @param restaurantId 경로변수, 리뷰를 생성할 맛집의 PK
   * @param req 사용자 객체가 포함된 Request 객체
   * @param res Response 객체
   * @returns Location 헤더와 생성된 리뷰 id 바디를 포함하는 Response 객체
   */
  @Post(':id/reviews')
  async createReview(
    @Body() createReviewDto: CreateReviewDto,
    @Param('id') restaurantId: string,
    @Req() req: MemberRequest,
    @Res() res: Response,
  ): Promise<Response> {
    const review = await this.restaurantsService.createReview(createReviewDto, restaurantId, req.member.id);
    const location = `${req.path}/${review.id}`;

    return res.status(HttpStatus.CREATED).setHeader('Location', location).json({ id: review.id });
  }

  /*
   * 특정 위치를 기준으로 일정 거리 안에 있는 맛집들을 조회합니다.
   * @param queries 검색 조건
   * @returns 맛집 목록
   */
  @Get()
  async findList(@Query() queries: RestaurantQueryDto): Promise<RestaurantResponseDto[]> {
    const restaurants = await this.restaurantsService.findList({
      lon: queries.lon,
      lat: queries.lat,
      range: queries.range,
      sortBy: queries.sortBy,
      orderBy: queries.orderBy,
      page: queries.page,
      pageSize: queries.pageSize,
    });

    return restaurants;
  }

  /**
   * 맛집id를 통해 맛집의 상세 정보를 조회합니다.
   * @param id 맛집 id
   * @returns 리뷰를 포함한 맛집 상세 정보
   */
  @Get(':id')
  async findOneDetail(@Param('id') id: string): Promise<RestaurantResponseDto | null> {
    const restaurant = await this.restaurantsService.findOneDetail(id);

    return restaurant;
  }
}
