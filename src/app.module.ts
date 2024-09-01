import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { DatabaseConfigModule } from './config/database/configuration.module';
import { DatabaseConfigService } from './config/database/configuration.service';
import { Member } from './entities/member.entity';
import { Restaurant } from './entities/restaurant.entity';
import { Review } from './entities/review.entity';
import { MembersModule } from './members/members.module';
import { RestaurantsModule } from './restaurants/restaurants.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [DatabaseConfigModule],
      useClass: DatabaseConfigService,
    }),
    //FIXME: 테이블 생성을 위한 것으로 추후 삭제합니다.
    TypeOrmModule.forFeature([Member, Restaurant, Review]),
    MembersModule,
    RestaurantsModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
