import { faker } from '@faker-js/faker';

import { BaseModelFactory } from './base-model.factory';

type ReviewFactoryParams = { memberId?: string; restaurantId?: string };

export const reviewFactory = ({ memberId, restaurantId }: ReviewFactoryParams) => ({
  ...BaseModelFactory(),
  content: faker.lorem.paragraph(),
  rating: faker.number.int({ min: 1, max: 5 }),
  memberId,
  restaurantId,
});
