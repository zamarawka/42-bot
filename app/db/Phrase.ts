import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import User from './User';

@Entity({ name: 'phrases' })
export default class Phrase extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  content!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'user_id' })
  userId!: number;

  @ManyToOne(() => User, (user) => user.phrases)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  static async getRandom() {
    return await this.createQueryBuilder().select().orderBy('RANDOM()').getOne();
  }

  static async getTop() {
    return await this.createQueryBuilder('phrases')
      .addSelect('COUNT("content")', 'count')
      .groupBy('user_id')
      .leftJoinAndSelect('phrases.user', 'user')
      .orderBy('count', 'DESC')
      .limit(15)
      .getRawAndEntities();
  }
}
