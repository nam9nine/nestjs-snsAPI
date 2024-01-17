import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  Type,
  ValidationPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './posts.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CommonModule } from 'src/common/common.module';
import { ImageModel } from 'src/common/entities/image.entity';
import { ImageService } from './image/image.service';
import { LogMidddleware } from 'src/common/intercepter/middleware/log.middleware';
import { CommentModel } from './comments/entities/comment.entity';
import { CommentsController } from './comments/comments.controller';
import { CommentsModule } from './comments/comments.module';

const validationPipe = new ValidationPipe({
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
  whitelist: true,
  forbidNonWhitelisted: true,
});
@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel, ImageModel, CommentModel]),
    UsersModule,
    AuthModule,
    CommonModule,
    CommentsModule,
  ],
  exports: [PostsService],
  controllers: [PostsController],
  providers: [PostsService, ImageService],
})
export class PostsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMidddleware).forRoutes({
      path: 'posts',
      method: RequestMethod.GET,
    });
  }
}
