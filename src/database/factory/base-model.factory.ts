import { faker } from '@faker-js/faker';

import { BaseModel } from '../../entities/base-model.entity';

export const BaseModelFactory = (): BaseModel => {
  // 23년 1월 ~ 현재 날짜 사이의 날짜를 랜덤으로 생성
  const [createdAt, updatedAt] = faker.date.betweens({ from: '2023-01-01', to: new Date(), count: 2 });
  return {
    id: faker.string.uuid(),
    createdAt,
    updatedAt,
  };
};
