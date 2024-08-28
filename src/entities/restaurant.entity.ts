import { Column, Entity, OneToMany, Unique } from 'typeorm';

import { BaseModel } from './base-model.entity';
import { Review } from './review.entity';

@Entity()
@Unique(['name', 'address']) // { name, address }가 같은 맛집은 중복으로 등록되지 않도록 설정
export class Restaurant extends BaseModel {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  // TODO: 카테고리 확인 후 추후 enum으로 변경
  @Column({ type: 'varchar', length: 32, default: '미분류' })
  category: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  address: string;

  // real: 실수형 데이터 타입, 4byte
  @Column({ type: `real`, nullable: true })
  lon: number;

  @Column({ type: `real`, nullable: true })
  lat: number;

  @Column({ type: `real`, default: 0 }) // review 가 없을 경우 0으로 설정
  rating: number;

  // 맛집에 작성된 리뷰
  @OneToMany(() => Review, (review) => review.restaurant)
  reviews: Review[];
}
