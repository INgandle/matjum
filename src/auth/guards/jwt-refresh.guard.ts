import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthInfo, JwtUser } from '../strategies/jwt.types';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  handleRequest<TUser extends JwtUser>(err: Error, user: TUser, info: AuthInfo): TUser {
    if (err || !user) {
      // 리프레시 토큰이 만료된 경우
      if (info && info.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token has expired.');
      }

      // 리프레시 토큰이 유효하지 않은 경우
      if (info && info.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid refresh token.');
      }
      throw new UnauthorizedException('Refresh token authentication failed.');
    }
    return user;
  }
}
