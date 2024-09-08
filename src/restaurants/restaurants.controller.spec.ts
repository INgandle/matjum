import { NotFoundException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';

import { CreateReviewDto } from './dto/create-review.dto';
import { OrderBy, RestaurantQueryDto, SortBy } from './dto/restaurant-query.dto';
import { RestaurantResponseDto } from './dto/restaurant-response.dto';
import { MemberRequest, RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';

describe('RestaurantsController', () => {
  let controller: RestaurantsController;
  let service: RestaurantsService;

  const mockRestaurantsService = {
    findList: jest.fn(),
    findOneDetail: jest.fn(),
    createReview: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantsController],
      providers: [
        {
          provide: RestaurantsService,
          useValue: mockRestaurantsService,
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

  describe('findList', () => {
    it('Restaurant 배열이 반환됩니다.', async () => {
      const queryDto: RestaurantQueryDto = {
        lon: 127.0,
        lat: 37.5,
        range: 1000,
        sortBy: SortBy.ASC,
        orderBy: OrderBy.DISTANCE,
        page: 0,
        pageSize: 10,
      };

      const mockResponse: RestaurantResponseDto[] = [
        {
          id: '1',
          name: 'Restaurant A',
          address: '123 Main St',
          phoneNumber: '123-456-7890',
          category: 'Italian',
          rating: 4.5,
          lat: 37.5,
          lon: 127.0,
          distance: 500,
          lastModTs: new Date(),
        },
      ];

      mockRestaurantsService.findList.mockResolvedValue(mockResponse);

      const result = await controller.findList(queryDto);
      expect(result).toEqual(mockResponse);
      expect(mockRestaurantsService.findList).toHaveBeenCalledWith({
        lon: queryDto.lon,
        lat: queryDto.lat,
        range: queryDto.range,
        sortBy: queryDto.sortBy,
        orderBy: queryDto.orderBy,
        page: queryDto.page,
        pageSize: queryDto.pageSize,
      });
    });
  });

  describe('findOneDetail', () => {
    it('Restaurant의 상세 정보가 반환됩니다.', async () => {
      const id = '1';
      const mockResponse: RestaurantResponseDto = {
        id: '1',
        name: 'Restaurant A',
        address: '123 Main St',
        phoneNumber: '123-456-7890',
        category: 'Italian',
        rating: 4.5,
        lat: 37.5,
        lon: 127.0,
        distance: 500,
        lastModTs: new Date(),
        reviews: [{ id: '1', content: 'Great food!', rating: 5, memberId: 'test', restaurantId: 'test' }],
      };

      mockRestaurantsService.findOneDetail.mockResolvedValue(mockResponse);

      const result = await controller.findOneDetail(id);
      expect(result).toEqual(mockResponse);
      expect(mockRestaurantsService.findOneDetail).toHaveBeenCalledWith(id);
    });

    it('Restaurant가 없으면 Not Found로 처리됩니다.', async () => {
      const id = '1';
      mockRestaurantsService.findOneDetail.mockImplementation(() => {
        throw new NotFoundException('Restaurant not found');
      });

      await expect(controller.findOneDetail(id)).rejects.toThrow(NotFoundException);
      expect(mockRestaurantsService.findOneDetail).toHaveBeenCalledWith(id);
    });
  });
});
