import { PickType } from '@nestjs/mapped-types';
import { UsersModel } from 'src/users/entities/users.entity';

export class registerDto extends PickType(UsersModel, [
  'nickname',
  'email',
  'password',
]) {}
