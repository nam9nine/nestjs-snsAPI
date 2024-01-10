import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './posts.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel]),
    UsersModule,
    AuthModule,
    CommonModule,
  ], //레퍼지토리 만드는 코드? IOC컨테이너 위에 올린다
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
