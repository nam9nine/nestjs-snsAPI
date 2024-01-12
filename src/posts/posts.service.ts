import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsModel } from './posts.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { updatePostDto } from './dto/update-post.dto';
import { paginateDto } from './dto/paginate-post.dto';
import { CommonService } from 'src/common/common.service';
import { promises } from 'fs';
import {
  POST_ROUTER_IMAGE_PATH,
  TEMP_FODER_PATH,
} from 'src/common/const/path.const';
import { basename, join } from 'path';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private readonly commonService: CommonService,
  ) {}

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
      relations: ['author'],
    }); //await 키워드 안 쓰면 promise객체가 즉시 반환되어 오류 감지 못 함
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  async moveFile(dto: CreatePostDto) {
    const tempPath = join(TEMP_FODER_PATH, dto.image);
    try {
      await promises.access(tempPath);
    } catch (e) {
      throw new BadRequestException('temp에 파일이 없습니다');
    }
    const fileName = basename(tempPath);
    const newPath = join(POST_ROUTER_IMAGE_PATH, fileName);
    await promises.rename(tempPath, newPath);
    return true;
  }

  async createPost(postDto: CreatePostDto, authorId: number) {
    const post = this.postsRepository.create({
      author: {
        id: authorId,
      },
      ...postDto,
      likeCount: 0,
      commentCount: 0,
    });
    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async patchPost(id: number, body: updatePostDto) {
    const { title, content } = body;
    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }
    const updateTitle = title || post.title;
    const updateContent = content || post.content;

    const newPost = await this.postsRepository.save({
      ...post,
      title: updateTitle,
      content: updateContent,
    });

    return newPost;
  }
  async deletePost(id: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
    });
    if (!post) {
      throw new NotFoundException();
    }
    this.postsRepository.delete(id);
  }
  async getPosts(dto: paginateDto) {
    return this.commonService.paginate<PostsModel>(
      dto,
      this.postsRepository,
      'posts',
      {},
    );
  }
}
