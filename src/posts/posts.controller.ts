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
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsModel } from './posts.entity';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token-guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { updatePostDto } from './dto/update-post.dto';
import { paginateDto } from './dto/paginate-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  @Get()
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

  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostRandom(@User('id') id: number) {
    return await this.postsService.createRandomPost(id);
  }
}