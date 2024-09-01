import { Column, CreateDateColumn, Entity, Point, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

/**
 * data-pipeline에서 사용하는 restaurant 엔티티
 */
@Entity()
@Unique(['name', 'address']) // { name, address }가 같은 맛집은 중복으로 등록되지 않도록 설정
export class Restaurant {
  // insert 이전에 uuid를 생성하여 넣어준다.
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  // TODO: 카테고리 확인 후 추후 enum으로 변경
  @Column({ type: 'varchar', length: 32, default: '미분류' })
  category: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  address: string;

  /**
   * 4326 - WGS 84 좌표계, 위도와 경도를 도(degrees) 단위로 표현함, 지구의 곡률을 고려하여 정확하게 거리를 계산하기 위해 필요함
   * 기본값은 0, 평면 좌표계
   * */
  @Column({ type: 'geometry', nullable: true, srid: 4326 })
  location: Point;

  @Column({ type: 'real', default: 0 }) // review 가 없을 경우 0으로 설정
  rating: number;

  // api 서버에서 업데이트 된 시간 - lastModTs
  @Column()
  lastModTs: Date;
}
