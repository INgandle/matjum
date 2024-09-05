import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';

export const refreshAuthKey = 'refreshAuth';

export const RefreshAuth = (): ReturnType<typeof applyDecorators> =>
  applyDecorators(SetMetadata(refreshAuthKey, true), UseGuards(JwtRefreshGuard));
