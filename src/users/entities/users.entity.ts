import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RolesEnum } from '../const/enum.const';
import { PostsModel } from 'src/posts/posts.entity';
import { BaseModel } from 'src/common/entities/base.entitiy';
import { IsEmail, Length, ValidationArguments } from 'class-validator';
import { lengthValidationFunc } from 'src/common/validation-message/length-validation.message';

@Entity()
export class UsersModel extends BaseModel {
  @Column({
    length: 20,
    unique: true,
  })
  @Length(1, 20, {
    message: lengthValidationFunc,
  })
  nickname: string;

  @Column({
    unique: true,
  })
  @IsEmail()
  email: string;

  @Column()
  @Length(3, 8, {
    message: lengthValidationFunc,
  })
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (posts) => posts.author)
  posts: PostsModel[];
}
