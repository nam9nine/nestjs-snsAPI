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
  /**
   * common에서 받은 포스터 이름을 받아온다
   * 업로드 버튼이 눌린 순간 받아온 파일 이름을 엔티티 image에 추가하고 포스터를 생성한다
   */

  @Post()
  @UseGuards(AccessTokenGuard)
  async postPost(@User('id') id: number, @Body() body: CreatePostDto) {
    await this.postsService.moveFile(body);
    return this.postsService.createPost(body, id);
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
