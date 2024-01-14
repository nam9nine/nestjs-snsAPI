import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageModel } from 'src/common/entities/image.entity';
import { QueryRunner, Repository } from 'typeorm';

import {
  POST_ROUTER_IMAGE_PATH,
  TEMP_FODER_PATH,
} from 'src/common/const/path.const';
import { basename, join } from 'path';
import { promises } from 'fs';
import { ImageUrlDto } from './dto/imageUrl.dto';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(ImageModel)
    private readonly imagesRepository: Repository<ImageModel>,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<ImageModel>(ImageModel)
      : this.imagesRepository;
  }

  async creatPostImage(dto: ImageUrlDto, qr?: QueryRunner) {
    const repository = this.getRepository(qr);
    const tempPath = join(TEMP_FODER_PATH, dto.path);
    try {
      await promises.access(tempPath);
    } catch (e) {
      throw new BadRequestException('temp에 파일이 없습니다');
    }

    const fileName = basename(tempPath);
    const newPath = join(POST_ROUTER_IMAGE_PATH, fileName);

    const image = repository.create({
      ...dto,
    });
    await repository.save(image);

    await promises.rename(tempPath, newPath);

    return true;
  }
}
