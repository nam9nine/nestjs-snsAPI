import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './posts.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CommonModule } from 'src/common/common.module';
import { ImageModel } from 'src/common/entities/image.entity';
import { ImageService } from './image/image.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel, ImageModel]),
    UsersModule,
    AuthModule,
    CommonModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, ImageService],
})
export class PostsModule {}
