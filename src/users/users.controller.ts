import { Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token-guard';
import { User } from './decorator/user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Post()
  // createUser(
  //   @Body('nickname') nickname: string,
  //   @Body('email') email: string,
  //   @Body('password') password: string,
  // ) {
  //   return this.usersService.createUser({ nickname, email, password });
  // }
  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }
  @Delete()
  @UseGuards(AccessTokenGuard)
  deleteUser(@User('id') id: number) {
    return this.usersService.deleteUser(id);
  }
}

//comment delete는
