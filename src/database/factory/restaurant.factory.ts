import { faker } from '@faker-js/faker';

import { BaseModelFactory } from './base-model.factory';

export const restaurantFactory = () => {
  const location = {
    type: 'Point',
    coordinates: [faker.location.longitude({ min: 126, max: 128 }), faker.location.latitude({ min: 36, max: 38 })],
  };
  return {
    ...BaseModelFactory(),
    name: faker.string.alphanumeric({ length: { min: 10, max: 40 } }),
    category: faker.string.alphanumeric({ length: { min: 3, max: 10 } }),
    phoneNumber: faker.phone.number(),
    address: faker.location.streetAddress({ useFullAddress: true }),
    location,
    rating: faker.number.float({ min: 1, max: 5 }),
  };
};
