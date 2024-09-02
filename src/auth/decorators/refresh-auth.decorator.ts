import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';

export const refreshAuthKey = 'refreshAuth';
export const RefreshAuth = () => applyDecorators(SetMetadata(refreshAuthKey, true), UseGuards(JwtRefreshGuard));
