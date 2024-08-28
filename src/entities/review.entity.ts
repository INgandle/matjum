import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseModel } from './base-model.entity';
import { Member } from './member.entity';
import { Restaurant } from './restaurant.entity';

@Entity()
export class Review extends BaseModel {
  @Column({ type: 'varchar', length: 255 })
  content: string;

  @Column({ type: 'smallint' })
  rating: number;

  @Column()
  memberId: string;

  @Column()
  restaurantId: string;

  // 리뷰 작성한 사용자
  @ManyToOne(() => Member, (member) => member.reviews)
  member: Member;

  // 리뷰 작성한 맛집
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.reviews)
  restaurant: Restaurant;
}
