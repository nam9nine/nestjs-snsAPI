import { PickType } from '@nestjs/mapped-types';
import { ImageModel } from 'src/common/entities/image.entity';

export class ImageUrlDto extends PickType(ImageModel, [
  'order',
  'path',
  'type',
  'post',
]) {}
