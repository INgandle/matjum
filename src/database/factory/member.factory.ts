import { faker } from '@faker-js/faker';

import { BaseModelFactory } from './base-model.factory';

export const memberFactory = () => {
  const location = {
    type: 'Point',
    coordinates: [faker.location.longitude({ min: 126, max: 128 }), faker.location.latitude({ min: 36, max: 38 })],
  };
  return {
    ...BaseModelFactory(),
    name: faker.person.fullName(),
    accountName: faker.internet.userName(),
    password: faker.internet.password(),
    isRecommendationEnabled: faker.datatype.boolean(),
    location,
  };
};
