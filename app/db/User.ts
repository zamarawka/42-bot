import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import config from '../config';
import { isAngry } from '../utils';
import Phrase from './Phrase';

const notEmpty = (str: string | undefined | null) => str || '';

@Entity({ name: 'users' })
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  uid!: number;

  @Column({
    nullable: true,
  })
  name?: string;

  @Column({ default: 'new' })
  role: string = 'new';

  @Column({ name: 'first_name' })
  firstName!: string;

  @Column({ name: 'last_name', nullable: true })
  lastName?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Phrase, (phrase) => phrase.user)
  phrases!: Phrase[];

  get todayNumber() {
    return this.uid + new Date().getDate();
  }

  get viewName() {
    return (
      this.name ? `@${this.name}` : `${notEmpty(this.firstName)} ${notEmpty(this.lastName)}`
    ).trim();
  }

  get isAnnoy() {
    return isAngry(config.BOT_DAMN_RATE);
  }

  static async findOrCreate(
    uid: number,
    { name, role, firstName, lastName }: Pick<User, 'name' | 'role' | 'lastName' | 'firstName'>,
  ) {
    const user = await this.findOneBy({ uid });

    if (user) {
      return user;
    }

    const newUser = new this();

    newUser.uid = uid;
    newUser.name = name;
    newUser.role = role;
    newUser.firstName = firstName;
    newUser.lastName = lastName;

    await newUser.save();

    return newUser;
  }
}
