import { Module, forwardRef } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentModel } from './entities/comment.entity';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { PostsModule } from '../posts.module';
import { PostsService } from '../posts.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentModel]),
    UsersModule,
    AuthModule,
    CommonModule,
    forwardRef(() => PostsModule),
  ],
  exports: [CommentsService],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
