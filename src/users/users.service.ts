import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entities/users.entity';
import { Repository, TreeLevelColumn } from 'typeorm';
import { FollowModel } from './entities/follow-user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly UserRepository: Repository<UsersModel>,
    @InjectRepository(FollowModel)
    private readonly FollowRepositroy: Repository<FollowModel>,
  ) {}

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

  async getFollowers(userId: number) {
    const followerReq = await this.FollowRepositroy.find({
      where: {
        followee: {
          id: userId,
        },
      },
      relations: {
        followee: true,
        follower: true,
      },
    });
    if (!followerReq) {
      throw new BadRequestException('아직 아무도 팔로우를 하지 않았습니다');
    }
    return followerReq;
  }
  /**
  
   * - A가 B를 팔로우
   * 1. follow router를 실행
   * 2. 팔로우 요청을 보낸 유저를 찾아 해당 유저 레포지토리에 followerId를 가지고 followee속성에 followee아이디를 넣어 save한다
   * 
   * - B가 팔로워 수락
   * 1. A의 followModel 속성 isConfirm 속성을 true로 바꾼다 
   * 2. 만약 그 속성이 true라면 B의 속성 followers에 A의 유저 아이디를 집어 넣는다
   */
  // 1.1 ~ 1.2
  async followUser(followerId: number, followeeId: number) {
    const follow = await this.FollowRepositroy.save({
      followee: {
        id: followeeId,
      },
      follower: {
        id: followerId,
      },
    });
    return follow;
  }
  //2.1 ~ 2.2
  async isConfirmFollow(userId: number, followerId: number) {
    /**
     * follow repositroy로 isConfirm 속성을 True로 바꿔주고 follow속성에 그 다른 유저 정보를 넣고 그 다른 유저의 follower속성에는 지금 유저 정보를 넣는다
     * 1. userRepository로 userid를 입력하여 접근불가능 무조건 followId가 있어야함
     * 2. followRepository로 고유 followId로 접근가능
     */

    // A가 팔로우한 사람의 정보가 들어갈 곳 팔로우할 유저 id를 알 수 있다
    const followReq = await this.FollowRepositroy.findOne({
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
    await this.FollowRepositroy.save({
      ...followReq,
      isConfirmed: true,
      a: 1,
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
}
