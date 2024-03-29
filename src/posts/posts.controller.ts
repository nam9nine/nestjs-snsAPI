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
  UseFilters,
  BadRequestException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsModel } from './posts.entity';
import { updatePostDto } from './dto/update-post.dto';
import { paginateDto } from './dto/paginate-post.dto';
import { HttpExceptionFilter } from 'src/common/exception-filter/http.exception-filter';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from 'src/users/decorator/user.decorator';
import { TransactionInterceptor } from 'src/common/intercepter/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/transaction.decorator';
import { QueryRunner as QR } from 'typeorm';
import { ImageService } from './image/image.service';
import { ImageUsedType } from 'src/common/entities/image.entity';
import { Role } from 'src/users/const/role-metadata.const';
import { RolesEnum } from 'src/users/const/enum.const';
import { IsPublic } from 'src/common/decorator/is-public.decorator';
import { TokenEnum } from 'src/auth/const/token-enum.const';
import { IsPostMineOrAdminGuard } from './guards/is-post-mine-or-admin.guard';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly imageService: ImageService,
  ) {}
  @Get()
  @IsPublic(TokenEnum.ACCESS)
  @UseFilters(HttpExceptionFilter)
  // @UseInterceptors(LogInterceptor)
  async getAllPosts(@Query() query: paginateDto) {
    return this.postsService.getPosts(query);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  async createPost(
    @Body() body: CreatePostDto,
    @User('id') id: number,
    @QueryRunner() qr: QR,
  ) {
    const post = await this.postsService.createPost(body, id, qr);

    for (let i = 0; i < body.images.length; i++) {
      this.imageService.creatPostImage(
        {
          order: i,
          path: body.images[i],
          type: ImageUsedType.POST,
          post,
        },
        qr,
      );
    }
    return this.postsService.getPostById(post.id, qr);
  }

  @Get(':id')
  @IsPublic(TokenEnum.ACCESS)
  async getPost(@Param('id', ParseIntPipe) id: number): Promise<PostsModel> {
    return this.postsService.getPostById(id);
  }

  @Patch(':id')
  @UseGuards(IsPostMineOrAdminGuard)
  patchPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: updatePostDto,
  ) {
    return this.postsService.patchPost(id, body);
  }

  @Delete(':id')
  @Role(RolesEnum.ADMIN)
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }

  // @Post('random')
  // @UseGuards(AccessTokenGuard)
  // async postPostRandom(@User('id') id: number) {
  //   return await this.postsService.createRandomPost(id);
  // }
}
