import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { PostsModel } from './posts.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { updatePostDto } from './dto/update-post.dto';
import { paginateDto } from './dto/paginate-post.dto';
import { CommonService } from 'src/common/common.service';
import { ImageModel } from 'src/common/entities/image.entity';

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
      relations: ['author', 'images'],
    });
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }
  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<PostsModel>(PostsModel)
      : this.postsRepository;
  }
  async createPost(postDto: CreatePostDto, authorId: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);
    const post = repository.create({
      author: {
        id: authorId,
      },
      ...postDto,
      likeCount: 0,
      commentCount: 0,
      images: [],
    });
    const newPost = await repository.save(post);

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
      { relations: ['images', 'author'] },
    );
  }
}
