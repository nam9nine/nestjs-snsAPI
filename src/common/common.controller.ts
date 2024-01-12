import {
  Controller,
  Get,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommonService } from './common.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token-guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('image'))
  tempPost(@UploadedFile() file: Express.Multer.File) {
    return {
      fileName: file.filename,
    };
  }
}
