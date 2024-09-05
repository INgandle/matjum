import { SetMetadata } from '@nestjs/common';

export const IsPublicKey = 'isPublic';
export const Public = (): ReturnType<typeof SetMetadata> => SetMetadata(IsPublicKey, true);
