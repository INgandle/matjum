import { Column, Entity, OneToMany } from 'typeorm';

import { BaseModel } from './base-model.entity';
import { Review } from './review.entity';

@Entity()
export class Member extends BaseModel {
  @Column({ type: 'varchar', length: 32, unique: true })
  accountName: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'real', nullable: true })
  lon: number;

  @Column({ type: 'real', nullable: true })
  lat: number;

  @Column()
  isRecommendationEnabled: boolean;

  // 사용자가 작성한 리뷰
  @OneToMany(() => Review, (review) => review.member)
  reviews: Review[];
}
