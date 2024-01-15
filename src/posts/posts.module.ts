import {
  MiddlewareConsumer,
  Module,
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
import { MiddlewareConfigProxy, NestModule } from '@nestjs/common/interfaces';
import { LogMidddleware } from 'src/common/intercepter/middleware/log.middleware';

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
    TypeOrmModule.forFeature([PostsModel, ImageModel]),
    UsersModule,
    AuthModule,
    CommonModule,
  ],
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
