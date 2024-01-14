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
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsModel } from './posts.entity';
import { updatePostDto } from './dto/update-post.dto';
import { paginateDto } from './dto/paginate-post.dto';
import { LogInterceptor } from 'src/common/intercepter/log.interceptor';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  @Get()
  // @UseInterceptors(LogInterceptor)
  async getAllPosts(@Query() query: paginateDto) {
    return this.postsService.getPosts(query);
  }

  @Get(':id')
  async getPost(@Param('id', ParseIntPipe) id: number): Promise<PostsModel> {
    return this.postsService.getPostById(id);
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
