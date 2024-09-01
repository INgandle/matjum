import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

import { IsPublicKey } from '../decorators/public.decorator';
import { JwtUser } from '../strategies/jwt.types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super(); //AuthGuard('jwt') 기능을 상속 받음
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IsPublicKey, [context.getHandler(), context.getClass()]);
    if (isPublic === true) {
      return true;
    }
    return super.canActivate(context); //jwt 유효성 검사
  }

  // TUser 제네릭을 사용하여 기본값을 JwtUser로 설정
  // JwtUser 타입을 기본으로 사용하면서도 필요에 따라 다른 타입 지원 가능
  handleRequest<TUser extends JwtUser = JwtUser>(
    err: Error | null,
    user: TUser | false | null,
    info: string | undefined,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      throw new UnauthorizedException('Authentication failed');
    }

    // 요청 객체에 사용자 정보 추가
    const request = context.switchToHttp().getRequest();
    request.user = user;

    return user as TUser;
  }
}
