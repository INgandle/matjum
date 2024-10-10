import { DataSource } from 'typeorm';

import { memberFactory } from '../factory/member.factory';
import { restaurantFactory } from '../factory/restaurant.factory';
import { reviewFactory } from '../factory/review.factory';

export default async (dataSource: DataSource): Promise<number[]> => {
  return dataSource.transaction(async (manager) => {
    const memberSeeds = Array(+process.argv[2]).fill(0).map(memberFactory);
    const memberResult = await manager.getRepository('Member').save(memberSeeds);

    const restaurantSeeds = Array(+process.argv[2]).fill(0).map(restaurantFactory);
    const restaurantResult = await manager.getRepository('Restaurant').save(restaurantSeeds);

    // review 데이터 생성
    // ? memberId, restaurantId는 이중 반복문으로
    const reviewSeeds = [
      ...memberResult.map((member) => {
        return restaurantResult.map((restaurant) =>
          reviewFactory({ memberId: member.id, restaurantId: restaurant.id }),
        );
      }),
    ];

    const reviewResult = await manager.getRepository('Review').save(reviewSeeds.flat());

    return [memberResult.length, restaurantResult.length, reviewResult.length];
  });
};
