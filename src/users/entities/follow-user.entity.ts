import { BaseModel } from 'src/common/entities/base.entitiy';
import { Column, Entity, ManyToOne } from 'typeorm';
import { UsersModel } from './users.entity';
import { IsNumber } from 'class-validator';

@Entity()
export class FollowModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.followees)
  followee: UsersModel;

  @ManyToOne(() => UsersModel, (user) => user.followers)
  follower: UsersModel;

  @Column({
    default: false,
  })
  isConfirmed: boolean;
}
