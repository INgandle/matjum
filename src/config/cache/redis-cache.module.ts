import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.registerAsync<CacheModuleOptions>({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService): Promise<CacheModuleOptions> => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
        password: configService.get<string>('REDIS_PASSWORD'),
        ttl: 30 * 24 * 60 * 60, // 캐시 기본 만료 시간:  30일 (초 단위)
      }),
      inject: [ConfigService], //ConfigService를 주입받아 사용
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule {}
