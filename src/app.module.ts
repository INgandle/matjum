import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfigModule } from './config/database/configuration.module';
import { DatabaseConfigService } from './config/database/configuration.service';
import { Member } from './entities/member.entity';
import { Restaurant } from './entities/restaurant.entity';
import { Review } from './entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [DatabaseConfigModule],
      useClass: DatabaseConfigService,
    }),
    //FIXME: 테이블 생성을 위한 것으로 추후 삭제합니다.
    TypeOrmModule.forFeature([Member, Restaurant, Review]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
