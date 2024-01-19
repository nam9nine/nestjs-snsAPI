import { Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token-guard';
import { User } from './decorator/user.decorator';
import { RolesEnum } from './const/enum.const';
import { Role } from './const/role-metadata.const';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Role(RolesEnum.ADMIN)
  getUsers() {
    return this.usersService.getUsers();
  }

  @Delete()
  @Role(RolesEnum.ADMIN)
  deleteUser(@User('id') id: number) {
    return this.usersService.deleteUser(id);
  }
}
