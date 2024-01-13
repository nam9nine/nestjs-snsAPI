import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  InternalServerErrorException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsModel } from './posts.entity';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token-guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { updatePostDto } from './dto/update-post.dto';
import { paginateDto } from './dto/paginate-post.dto';
import { ImageService } from './image/image.service';
import { UsedType } from 'src/common/entities/image.entity';
import { DataSource } from 'typeorm';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly imagesService: ImageService,
    private readonly dataSource: DataSource,
  ) {}
  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async getAllPosts(@Query() query: paginateDto) {
    return this.postsService.getPosts(query);
  }

  @Get(':id')
  async getPost(@Param('id', ParseIntPipe) id: number): Promise<PostsModel> {
    return this.postsService.getPostById(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  async postPost(@User('id') id: number, @Body() body: CreatePostDto) {
    const qr = await this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const post = await this.postsService.createPost(body, id, qr);

      for (let i = 0; i < body.images.length; i++) {
        await this.imagesService.creatPostImage(
          {
            post,
            order: i,
            path: body.images[i],
            type: UsedType.POST,
          },
          qr,
        );
      }
      await qr.commitTransaction();
      await qr.release();
      return this.postsService.getPostById(post.id);
    } catch (e) {
      await qr.rollbackTransaction();
      await qr.release();
    }
  }

  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: updatePostDto,
  ) {
    return this.postsService.patchPost(id, body);
  }

  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }

  // @Post('random')
  // @UseGuards(AccessTokenGuard)
  // async postPostRandom(@User('id') id: number) {
  //   return await this.postsService.createRandomPost(id);
  // }
}
