import { Controller, Post, Body, Param, Res, HttpStatus, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { Member } from '../entities/member.entity';

import { CreateReviewDto } from './dto/create-review.dto';
import { RestaurantsService } from './restaurants.service';

type MemberRequest = Request & {
  member: Member;
};

@ApiTags('restaurants')
@Controller('restaurants')
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
}
