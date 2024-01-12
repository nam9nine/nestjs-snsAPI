import { BadRequestException, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './posts.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CommonModule } from 'src/common/common.module';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import * as multer from 'multer';

import { v4 as uuid } from 'uuid';
import { POST_IMAGE_PATH } from 'src/common/const/path.const';
@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel]),
    UsersModule,
    AuthModule,
    CommonModule,
    MulterModule.register({
      limits: { fileSize: 5000000 },
      fileFilter: (res, file, cb) => {
        const exp = extname(file.originalname);
        if (exp !== '.jpg' && exp !== '.png' && exp !== '.jpeg') {
          return cb(
            new BadRequestException('jpg, png, jpeg파일로만 업로드 가능합니다'),
            false,
          );
        }

        return cb(null, true);
      },
      storage: multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, POST_IMAGE_PATH);
        },
        filename: function (req, file, cb) {
          cb(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
