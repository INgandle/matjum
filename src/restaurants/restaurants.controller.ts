import { Controller, Post, Body, Param, Res, HttpStatus, Req } from '@nestjs/common';
import { Request, Response } from 'express';

import { Member } from '../entities/member.entity';

import { CreateReviewDto } from './dto/create-review.dto';
import { RestaurantsService } from './restaurants.service';

interface MemberRequest extends Request {
  member: Member;
}

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

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
