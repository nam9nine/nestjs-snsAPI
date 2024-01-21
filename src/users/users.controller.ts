import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token-guard';
import { User } from './decorator/user.decorator';
import { RolesEnum } from './const/enum.const';
import { Role } from './const/role-metadata.const';
import { TransactionInterceptor } from 'src/common/intercepter/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/transaction.decorator';
import { QueryRunner as QR } from 'typeorm';

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
  followMe(
    @User('id') id: number,
    @Query('isIncludeConfirmed', new DefaultValuePipe(false), ParseBoolPipe)
    isIncludeConfirmed: boolean,
  ) {
    return this.usersService.getFollowers(id, isIncludeConfirmed);
  }
  @Post('follow/:id')
  followUser(
    @Param('id', ParseIntPipe) followeeId: number,
    @User('id') followerId: number,
  ) {
    return this.usersService.followUser(followerId, followeeId);
  }
  //followeeId, followerId를 평소와의 관점과 반대로 해석
  @Patch('follow/:followerId/confirm')
  @UseInterceptors(TransactionInterceptor)
  async confirmFollow(
    @User('id') id: number,
    @Param('followerId', ParseIntPipe) followerId: number,
    @QueryRunner() qr: QR,
  ) {
    await this.usersService.isConfirmFollow(id, followerId, qr);
    await this.usersService.increaseFollower(id, qr);
    await this.usersService.increaseFollowee(followerId, qr);
    return true;
  }
  @Delete('follow/:followeeId')
  @UseInterceptors(TransactionInterceptor)
  async rejectFollow(
    @Param('followeeId') followeeId: number,
    @User('id') userId: number,
    @QueryRunner() qr: QR,
  ) {
    await this.usersService.deleteFollow(userId, followeeId, qr);
    await this.usersService.decreaseFollower(followeeId, qr);
    await this.usersService.decreaseFollowee(userId, qr);
    return true;
  }
}
