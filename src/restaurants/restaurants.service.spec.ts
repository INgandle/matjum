import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InsertResult, Repository, SelectQueryBuilder, UpdateResult } from 'typeorm';

import { Restaurant } from '../entities/restaurant.entity';
import { Review } from '../entities/review.entity';

import { RestaurantsService } from './restaurants.service';

describe('RestaurantsService', () => {
  let service: RestaurantsService;
  let reviewRepository: Repository<Review>;
  let restaurantRepository: Repository<Restaurant>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        {
          provide: getRepositoryToken(Review),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Restaurant),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<RestaurantsService>(RestaurantsService);
    reviewRepository = module.get<Repository<Review>>(getRepositoryToken(Review));
    restaurantRepository = module.get<Repository<Restaurant>>(getRepositoryToken(Restaurant));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(reviewRepository).toBeDefined();
    expect(restaurantRepository).toBeDefined();
  });

  describe('findOneDetail', () => {
    it('Restaurant가 있으면 상세 정보를 반환합니다.', async () => {
      const id = '7e3b5f25-4c58-4d88-9dc9-1d2e638ef3f9';

      // TypeScript에서 정확한 타입을 지정
      const queryBuilderMock: Partial<SelectQueryBuilder<Restaurant>> = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null), // mockResolvedValue 사용 가능
      };

      jest
        .spyOn(restaurantRepository, 'createQueryBuilder')
        .mockReturnValue(queryBuilderMock as SelectQueryBuilder<Restaurant>);

      await expect(service.findOneDetail(id)).rejects.toThrow(NotFoundException);

      // 모의 함수가 호출되었는지 확인
      expect(queryBuilderMock.getRawOne).toHaveBeenCalled();
    });

    it('Restaurant가 존재하면 상세 정보를 반환합니다.', async () => {
      const id = '7e3b5f25-4c58-4d88-9dc9-1d2e638ef3f9';
      const mockResult = {
        id: '1',
        name: 'Restaurant A',
        address: '123 Main St',
        phoneNumber: '123-456-7890',
        category: 'Italian',
        rating: 4.5,
        lat: 37.5,
        lon: 127.0,
        reviews: JSON.stringify([{ id: '1', content: 'Great food!', rating: 5 }]),
      };

      const queryBuilderMock: Partial<SelectQueryBuilder<Restaurant>> = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockResult),
      };

      jest
        .spyOn(restaurantRepository, 'createQueryBuilder')
        .mockReturnValue(queryBuilderMock as SelectQueryBuilder<Restaurant>);

      const result = await service.findOneDetail(id);
      expect(result).toEqual(mockResult);

      // 모의 함수가 호출되었는지 확인
      expect(queryBuilderMock.getRawOne).toHaveBeenCalled();
    });

    describe('createReview', () => {
      const restaurantId = '550e8400-e29b-41d4-a716-446655440000';
      const memberId = '2bbbe5bb-5f3d-4bbb-97d8-d0ed2d7d630a';
      const reviewId = '625ad103-1fbe-404b-a865-cc09990b37ec';
      const createReviewDto = {
        content: '너무너무 맛있어요.',
        rating: 5,
      };

      it('성공적으로 리뷰를 생성하고 생성된 리뷰의 id 반환', async () => {
        const rating = 4.3;
        const restaurant = { id: restaurantId } as Restaurant;

        jest.spyOn(restaurantRepository, 'findOneBy').mockResolvedValue(restaurant);
        jest.spyOn(reviewRepository, 'findOneBy').mockResolvedValue(null);
        jest
          .spyOn(reviewRepository, 'insert')
          .mockResolvedValue({ identifiers: [{ id: reviewId }] } as unknown as InsertResult);
        jest.spyOn(reviewRepository, 'average').mockResolvedValue(rating);
        jest
          .spyOn(restaurantRepository, 'update')
          .mockResolvedValue({ ...restaurant, rating } as unknown as UpdateResult);

        const result = await service.createReview(createReviewDto, restaurantId, memberId);

        expect(restaurantRepository.findOneBy).toHaveBeenCalledWith({ id: restaurantId });
        expect(reviewRepository.findOneBy).toHaveBeenCalledWith({ memberId, restaurantId });
        expect(reviewRepository.insert).toHaveBeenCalledWith({ ...createReviewDto, restaurantId, memberId });
        expect(reviewRepository.average).toHaveBeenCalledWith('rating', { restaurantId });
        expect(restaurantRepository.update).toHaveBeenCalledWith({ id: restaurantId }, { rating });

        expect(result).toEqual({ id: reviewId });
      });

      it('존재하지 않는 맛집인 경우 404', async () => {
        jest.spyOn(restaurantRepository, 'findOneBy').mockResolvedValue(null);
        jest.spyOn(reviewRepository, 'findOneBy');

        await expect(service.createReview(createReviewDto, restaurantId, memberId)).rejects.toThrow(NotFoundException);

        expect(restaurantRepository.findOneBy).toHaveBeenCalledWith({ id: restaurantId });
        expect(reviewRepository.findOneBy).not.toHaveBeenCalled();
      });

      it('사용자가 이미 해당 맛집에 리뷰를 작성한 경우 409', async () => {
        const restaurant = { id: restaurantId } as Restaurant;
        const review = { id: reviewId } as Review;

        jest.spyOn(restaurantRepository, 'findOneBy').mockResolvedValue(restaurant);
        jest.spyOn(reviewRepository, 'findOneBy').mockResolvedValue(review);
        jest.spyOn(reviewRepository, 'insert');

        await expect(service.createReview(createReviewDto, restaurantId, memberId)).rejects.toThrow(ConflictException);

        expect(restaurantRepository.findOneBy).toHaveBeenCalledWith({ id: restaurantId });
        expect(reviewRepository.findOneBy).toHaveBeenCalledWith({ restaurantId, memberId });
        expect(reviewRepository.insert).not.toHaveBeenCalled();
      });
    });
  });
});
