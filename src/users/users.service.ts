import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly UserRepository: Repository<UsersModel>,
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
}
