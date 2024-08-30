import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';

import { Member } from '../entities/member.entity';

import { MembersController } from './members.controller';
import { MembersService } from './members.service';

@Module({
  imports: [TypeOrmModule.forFeature([Member]), AuthModule],
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}
