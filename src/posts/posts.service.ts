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

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private readonly commonService: CommonService,
  ) {}

  async getPostById(id: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);
    const post = repository.findOne({
      where: {
        id,
      },
      relations: ['author', 'images', 'comments'],
    });
    if (!post) {
      throw new NotFoundException('post를 찾을 수가 없습니다');
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
    try {
      this.postsRepository.delete(id);
      return true;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
  async getPosts(dto: paginateDto) {
    return this.commonService.paginate<PostsModel>(
      dto,
      this.postsRepository,
      'posts',
      { relations: ['images', 'author', 'comments'] },
    );
  }
  async checkPostExistById(id: number) {
    return this.postsRepository.exist({
      where: {
        id,
      },
    });
  }
  async getMyPostById(userId: number, postId: number) {
    return this.postsRepository.exist({
      where: {
        id: postId,
        author: {
          id: userId,
        },
      },
    });
  }
}
