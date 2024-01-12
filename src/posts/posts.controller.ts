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
  UploadedFile,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsModel } from './posts.entity';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token-guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { updatePostDto } from './dto/update-post.dto';
import { paginateDto } from './dto/paginate-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
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
  @UseInterceptors(FileInterceptor('image'))
  async postPost(
    @User('id') id: number,
    @Body() body: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.postsService.createPost(body, id, file?.filename);
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
