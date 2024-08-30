import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RedisCacheModule } from '../config/cache/redis-cache.module';
import { Member } from '../entities/member.entity';

import { JWT_ACCESS_EXPIRES_IN } from './auth.constants';
import { AuthService } from './auth.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: JWT_ACCESS_EXPIRES_IN },
      }),
    }),
    TypeOrmModule.forFeature([Member]),
    ConfigModule,
    RedisCacheModule,
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
