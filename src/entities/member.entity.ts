import { Column, Entity, OneToMany, Point } from 'typeorm';

import { BaseModel } from './base-model.entity';
import { Review } from './review.entity';

@Entity()
export class Member extends BaseModel {
  @Column({ type: 'varchar', length: 32, unique: true })
  accountName: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  // 민감한 정보는 select: false로 설정하여 조회 시 제외
  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({ type: 'real', nullable: true })
  lon: number;

  @Column({ type: 'real', nullable: true })
  lat: number;

  /**
   * 4326 - WGS 84 좌표계, 위도와 경도를 도(degrees) 단위로 표현함, 지구의 곡률을 고려하여 정확하게 거리를 계산하기 위해 필요함
   * 기본값은 0, 평면 좌표계
   * */
  @Column({ type: 'geometry', nullable: true, srid: 4326 })
  location: Point;

  @Column({ default: false })
  isRecommendationEnabled: boolean;

  // 사용자가 작성한 리뷰
  @OneToMany(() => Review, (review) => review.member)
  reviews: Review[];
}
