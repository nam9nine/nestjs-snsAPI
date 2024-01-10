import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOneOptions,
  FindOptionsWhere,
  LessThan,
  Like,
  MoreThan,
  Repository,
} from 'typeorm';
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

  // async paginatePost(dto: paginateDto) {
  //   if (dto.page) {
  //     return this.pagePaginatePost(dto);
  //   } else {
  //     return this.cursotPaginatePost(dto);
  //   }
  // }
  // async pagePaginatePost(dto: paginateDto) {
  //   const [posts, count] = await this.postsRepository.findAndCount({
  //     skip: dto.take * (dto.page - 1),
  //     order: {
  //       createAt: dto.order__createAt,
  //     },
  //     take: dto.take,
  //   });

  //   return {
  //     data: posts,
  //     total: count,
  //   };
  // }

  // async cursotPaginatePost(dto: paginateDto) {
  //   const where: FindOptionsWhere<PostsModel> = {};

  //   if (dto.where__id__less_than) {
  //     where.id = LessThan(dto.where__id__less_than);
  //   } else if (dto.where__id__more_than) {
  //     where.id = MoreThan(dto.where__id__more_than);
  //   }

  //   const posts = await this.postsRepository.find({
  //     relations: ['author'],
  //     where,
  //     order: {
  //       createAt: dto.order__createAt,
  //     },
  //     take: dto.take,
  //   });

  //   const lastPost =
  //     posts.length > 0 && posts.length === dto.take
  //       ? posts[posts.length - 1]
  //       : null;

  //   let nextRequestUrl = lastPost && new URL(`${PROTOCOL}://${HOST}/posts`);
  //   if (nextRequestUrl) {
  //     for (const key of Object.keys(dto)) {
  //       if (dto[key]) {
  //         if (
  //           key !== 'where__id__more_than' &&
  //           key !== 'where__id__less_than'
  //         ) {
  //           nextRequestUrl.searchParams.append(key, dto[key]);
  //         }
  //       }
  //     }
  //     let key = null;
  //     if (dto.order__createAt === 'ASC') {
  //       key = 'where__id__more_than';
  //     } else {
  //       key = 'where__id__less_than';
  //     }
  //     nextRequestUrl.searchParams.append(key, lastPost?.id.toString());
  //   }

  //   return {
  //     date: posts,
  //     corsor: {
  //       after: lastPost?.id ?? null,
  //     },
  //     posts: posts.length,
  //     next: nextRequestUrl?.toString() ?? null,
  //   };
  // }
  async createRandomPost(authorId: number) {
    for (let i = 0; i < 100; i++) {
      await this.createPost(
        {
          title: `임의로 생성된 포스트 제목 ${i}`,
          content: `임의로 생성된 포스트 내용 ${i}`,
        },
        authorId,
      );
    }
    return true;
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
