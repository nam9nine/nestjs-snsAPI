import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entities/users.entity';
import {
  FindOptionsWhere,
  QueryRunner,
  Repository,
  TreeLevelColumn,
} from 'typeorm';
import { FollowModel } from './entities/follow-user.entity';
import { Query } from 'typeorm/driver/Query';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly UserRepository: Repository<UsersModel>,
    @InjectRepository(FollowModel)
    private readonly FollowRepositroy: Repository<FollowModel>,
  ) {}

  getUsersRepositroy(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UsersModel>(UsersModel)
      : this.UserRepository;
  }

  getFollowRepository(qr: QueryRunner) {
    return qr
      ? qr.manager.getRepository<FollowModel>(FollowModel)
      : this.FollowRepositroy;
  }
  async createUser(user: Pick<UsersModel, 'nickname' | 'password' | 'email'>) {
    const nicknameExists = await this.UserRepository.exist({
      where: {
        nickname: user.nickname,
      },
    });
    if (nicknameExists) {
      throw new BadRequestException('닉네임이 이미 존재합니다');
    }
    const emailExists = await this.UserRepository.exist({
      where: {
        email: user.email,
      },
    });
    if (emailExists) {
      throw new BadRequestException('이메일이 존재합니다');
    }

    const userInfo = this.UserRepository.create({
      nickname: user.nickname,
      email: user.email,
      password: user.password,
    });

    return this.UserRepository.save(userInfo);
  }
  async getUsers() {
    const user = await this.UserRepository.find({
      relations: {
        posts: true,
        chats: true,
        comments: {
          user: true,
        },
        followees: true,
        followers: true,
      },
    });

    if (!user) {
      throw new NotFoundException('유저가 없습니다');
    }
    return user;
  }
  async getUsersWithEmail(email: string) {
    const existingUser = await this.UserRepository.findOne({
      where: {
        email,
      },
    });
    return existingUser;
  }
  async getUserById(id: number) {
    const user = await this.UserRepository.findOne({
      where: {
        id,
      },
    });
    return user;
  }
  async deleteUser(id: number) {
    await this.UserRepository.delete(id);
    return true;
  }

  async getFollowers(userId: number, isIncludeConfirmed: boolean) {
    const isConfirmed = isIncludeConfirmed ? true : null;

    const where: FindOptionsWhere<FollowModel> = {
      followee: {
        id: userId,
      },
      isConfirmed,
    };
    const followerReq = await this.FollowRepositroy.find({
      where,
      relations: {
        follower: true,
        followee: true,
      },
    });
    if (!followerReq) {
      throw new BadRequestException('아직 아무도 팔로우를 하지 않았습니다');
    }
    return followerReq.map((x) => ({
      followId: x.id,
      userId: x.follower.id,
      nickname: x.follower.nickname,
      isConfirmFollow: x.isConfirmed,
    }));
  }

  async followUser(followerId: number, followeeId: number, qr?: QueryRunner) {
    const FollowRepositroy = this.getFollowRepository(qr);
    const follow = await FollowRepositroy.save({
      followee: {
        id: followeeId,
      },
      follower: {
        id: followerId,
      },
    });
    return follow;
  }

  async isConfirmFollow(userId: number, followerId: number, qr?: QueryRunner) {
    const FollowRepositroy = this.getFollowRepository(qr);
    const followReq = await FollowRepositroy.findOne({
      where: {
        followee: {
          id: userId,
        },
        follower: {
          id: followerId,
        },
      },
    });
    if (!followReq) {
      throw new BadRequestException(
        '사용자가 팔로우 요청을 보낸 적이 없습니다',
      );
    }
    await FollowRepositroy.save({
      ...followReq,
      isConfirmed: true,
    });

    return true;
  }

  getAllFollow() {
    return this.FollowRepositroy.find({
      relations: {
        followee: true,
        follower: true,
      },
    });
  }
  async deleteFollow(userId: number, followeeId: number, qr: QueryRunner) {
    const FollowRepositroyT = this.getFollowRepository(qr);
    const follow = await FollowRepositroyT.findOne({
      where: {
        follower: {
          id: userId,
        },
        followee: {
          id: followeeId,
        },
      },
    });
    if (!follow) {
      throw new BadRequestException('팔로우 취소할 사용자가 없습니다');
    }
    await FollowRepositroyT.delete(follow.id);
    return true;
  }
  async increaseFollowee(followerId: number, qr?: QueryRunner) {
    const UsersRepositoryT = this.getUsersRepositroy(qr);

    await UsersRepositoryT.increment(
      {
        id: followerId,
      },
      'followeesCount',
      1,
    );
    return true;
  }
  async increaseFollower(followeeId: number, qr: QueryRunner) {
    const UsersRepositoryT = this.getUsersRepositroy(qr);

    await UsersRepositoryT.increment(
      {
        id: followeeId,
      },
      'followersCount',
      1,
    );
    return true;
  }
  async decreaseFollower(followeeId: number, qr?: QueryRunner) {
    const UsersRepositoryT = this.getUsersRepositroy(qr);
    await UsersRepositoryT.decrement(
      {
        id: followeeId,
      },
      'followersCount',
      1,
    );
    return true;
  }
  async decreaseFollowee(userId: number, qr?: QueryRunner) {
    const UsersRepositoryT = this.getUsersRepositroy(qr);
    await UsersRepositoryT.decrement(
      {
        id: userId,
      },
      'followeesCount',
      1,
    );
    return true;
  }
}
