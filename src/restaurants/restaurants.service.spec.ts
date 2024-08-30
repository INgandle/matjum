import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { Restaurant } from '../entities/restaurant.entity';

import { RestaurantsService } from './restaurants.service';

describe('RestaurantsService', () => {
  let service: RestaurantsService;
  let repository: Repository<Restaurant>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        {
          provide: getRepositoryToken(Restaurant),
          useClass: Repository, // 실제 Repository 클래스를 사용합니다.
        },
      ],
    }).compile();

    service = module.get<RestaurantsService>(RestaurantsService);
    repository = module.get<Repository<Restaurant>>(getRepositoryToken(Restaurant));
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

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(queryBuilderMock as SelectQueryBuilder<Restaurant>);

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

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(queryBuilderMock as SelectQueryBuilder<Restaurant>);

      const result = await service.findOneDetail(id);
      expect(result).toEqual(mockResult);

      // 모의 함수가 호출되었는지 확인
      expect(queryBuilderMock.getRawOne).toHaveBeenCalled();
    });
  });
});
