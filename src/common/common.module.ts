import { BadRequestException, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import * as multer from 'multer';
import { v4 as uuid } from 'uuid';
import { TEMP_ROUTER_IMAGE_PATH } from 'src/common/const/path.const';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 100000000,
      },
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
          cb(null, TEMP_ROUTER_IMAGE_PATH);
        },
        filename: function (req, file, cb) {
          cb(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
    UsersModule,
    AuthModule,
  ],
  exports: [CommonService],
  controllers: [CommonController],
  providers: [CommonService],
})
export class CommonModule {}
