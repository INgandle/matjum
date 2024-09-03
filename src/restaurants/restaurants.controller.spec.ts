import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';

import { CreateReviewDto } from './dto/create-review.dto';
import { MemberRequest, RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';

describe('RestaurantsController', () => {
  let controller: RestaurantsController;
  let service: RestaurantsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantsController],
      providers: [
        {
          provide: RestaurantsService,
          useValue: {
            createReview: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RestaurantsController>(RestaurantsController);
    service = module.get<RestaurantsService>(RestaurantsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('createReview', () => {
    const restaurantId = '550e8400-e29b-41d4-a716-446655440000';
    const memberId = '2bbbe5bb-5f3d-4bbb-97d8-d0ed2d7d630a';
    const reviewId = '625ad103-1fbe-404b-a865-cc09990b37ec';

    const createReviewDto: CreateReviewDto = {
      content: '너무너무 맛있어요!',
      rating: 5,
    };

    const req = {
      path: `/restaurants/${restaurantId}/reviews`,
      member: { id: memberId },
    } as MemberRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response> as Response;

    it('리뷰 생성하고 Location 헤더와 함께 응답 객체 반환', async () => {
      const review = { id: reviewId };
      jest.spyOn(service, 'createReview').mockResolvedValue(review);

      const result = await controller.createReview(createReviewDto, restaurantId, req, res);

      expect(service.createReview).toHaveBeenCalledWith(createReviewDto, restaurantId, memberId);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.setHeader).toHaveBeenCalledWith('Location', `${req.path}/${review.id}`);
      expect(res.json).toHaveBeenCalledWith({ id: review.id });
      expect(result).toBe(res);
    });
  });
});
