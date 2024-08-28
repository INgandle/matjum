import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * 모든 엔티티의 공통 필드를 정의한 추상 클래스
 */
export abstract class BaseModel {
  // insert 이전에 uuid를 생성하여 넣어준다.
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
