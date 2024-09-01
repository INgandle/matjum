import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtUser } from '../strategies/jwt.types';

@Injectable()
export class DevAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean {
    // 요청 객체에 가짜 사용자 정보 추가
    const request = context.switchToHttp().getRequest();
    const mockUser = this.createMockUser();
    request.user = mockUser;

    // 개발 환경에서는 항상 true를 반환하여 인증을 통과시킴
    return true;
  }

  private createMockUser(): JwtUser {
    return {
      id: '99fde318', // UUID
      accountName: 'dev_user',
      name: 'matjum',
    };
  }
}
