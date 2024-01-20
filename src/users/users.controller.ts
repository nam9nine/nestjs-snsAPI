import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token-guard';
import { User } from './decorator/user.decorator';
import { RolesEnum } from './const/enum.const';
import { Role } from './const/role-metadata.const';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }

  @Delete()
  @Role(RolesEnum.ADMIN)
  deleteUser(@User('id') id: number) {
    return this.usersService.deleteUser(id);
  }
  @Get('follow/all')
  getAllFollows() {
    return this.usersService.getAllFollow();
  }
  @Get('follow/me')
  followMe(@User('id') id: number) {
    return this.usersService.getFollowers(id);
  }
  @Post('follow/:id')
  followUser(
    @Param('id', ParseIntPipe) followeeId: number,
    @User('id') followerId: number,
  ) {
    return this.usersService.followUser(followerId, followeeId);
  }
  @Post('follow/confirm/:followerId')
  confirmFollow(
    @User('id') id: number,
    @Param('followerId') followerId: number,
  ) {
    return this.usersService.isConfirmFollow(id, followerId);
  }
}
