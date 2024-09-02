import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { OrderBy, RestaurantQueryDto, SortBy } from './dto/restaurant-query.dto';
import { RestaurantResponseDto } from './dto/restaurant-response.dto';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';

describe('RestaurantsController', () => {
  let controller: RestaurantsController;

  const mockRestaurantsService = {
    findList: jest.fn(),
    findOneDetail: jest.fn(),
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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findList', () => {
    it('should return an array of restaurants', async () => {
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
    it('should return a restaurant detail', async () => {
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
        reviews: [{ id: '1', content: 'Great food!', rating: 5, memberId: 'test', restaurantId: 'test' }],
      };

      mockRestaurantsService.findOneDetail.mockResolvedValue(mockResponse);

      const result = await controller.findOneDetail(id);
      expect(result).toEqual(mockResponse);
      expect(mockRestaurantsService.findOneDetail).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if restaurant is not found', async () => {
      const id = '1';
      mockRestaurantsService.findOneDetail.mockImplementation(() => {
        throw new NotFoundException('Restaurant not found');
      });

      await expect(controller.findOneDetail(id)).rejects.toThrow(NotFoundException);
      expect(mockRestaurantsService.findOneDetail).toHaveBeenCalledWith(id);
    });
  });
});
