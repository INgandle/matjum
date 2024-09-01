import { Module } from '@nestjs/common';

import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from 'src/entities/review.entity';
import { Restaurant } from 'src/entities/restaurant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Restaurant])],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
})
export class RestaurantsModule {}
