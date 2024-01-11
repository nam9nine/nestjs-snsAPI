import { BadRequestException, Injectable } from '@nestjs/common';
import { BasedPaginateDto } from './dto/paginate-based.dto';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { BaseModel } from './entities/base.entitiy';
import { MAPPER } from './const/filter-mappe.constr';

import { ENV_HOST_KEY, ENV_PROTOCOL_KEY } from './const/env-keys.const';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommonService {
  constructor(private readonly ConfigService: ConfigService) {}
  async paginate<T extends BaseModel>(
    dto: BasedPaginateDto,
    repository: Repository<T>,
    path: string,
    overrideOption?: FindManyOptions<T> | null,
  ) {
    if (dto.page) {
      return this.pagePaginate<T>(dto, repository, overrideOption);
    } else {
      return this.cursorPaginate<T>(dto, repository, path, overrideOption);
    }
  }

  async pagePaginate<T extends BaseModel>(
    dto: BasedPaginateDto,
    repository: Repository<T>,
    overrideOption: FindManyOptions<T>,
  ) {
    const option = this.composeFindOptions(dto);
    const [posts, count] = await repository.findAndCount({
      ...option,
      ...overrideOption,
    });

    return {
      data: posts,
      total: count,
    };
  }

  async cursorPaginate<T>(
    dto: BasedPaginateDto,
    repository: Repository<T>,
    path: string,
    overrideOption?: FindManyOptions<T>,
  ) {
    const optionObj = this.composeFindOptions<T>(dto);
    const posts = await repository.find({
      ...optionObj,
      ...overrideOption,
    });

    let lastPost =
      posts.length > 0 && posts.length === dto.take
        ? posts[posts.length - 1]
        : null;

    const protocol = this.ConfigService.get<string>(ENV_PROTOCOL_KEY);
    const host = this.ConfigService.get<string>(ENV_HOST_KEY);

    let nextUrl = lastPost ? new URL(`${protocol}://${host}/${path}`) : null;

    for (let key of Object.keys(dto)) {
      if (key !== 'where__id__more_than' && key !== 'where__id__less_than') {
        lastPost && nextUrl.searchParams.append(key, dto[key].toString());
      }
    }

    let key = null;
    if (dto.order__createAt === 'ASC') {
      key = 'where__id__more_than';
    } else {
      key = 'where__id__less_than';
    }

    lastPost && nextUrl.searchParams.append(key, lastPost['id'].toString());
    return {
      data: posts,
      nextUrl: dto.page ? null : lastPost && nextUrl.toString(),
      total: posts.length,
    };
  }

  composeFindOptions<T>(dto: BasedPaginateDto) {
    let order: FindOptionsOrder<T> = {};
    let where: FindOptionsWhere<T> = {};

    for (let [key, value] of Object.entries(dto)) {
      if (key.startsWith('where__')) {
        where = {
          ...where,
          ...this.parseWhereFilter<T>(key, value),
        };
      }
      if (key.startsWith('order__')) {
        order = {
          ...order,
          ...this.parseWhereFilter<T>(key, value),
        };
      }
    }

    return {
      take: dto.take,
      skip: dto.page ? dto.take * (dto.page - 1) : null,
      order,
      where,
    };
  }
  parseWhereFilter<T>(key: string, value: any): FindOptionsWhere<T> {
    let where: FindOptionsWhere<T> = {};
    const keyArr = key.split('__');

    if (keyArr.length !== 2 && keyArr.length !== 3) {
      throw new BadRequestException(
        `split을 __로 했을 때 길이가 2또는 3이 나오게 하시오 현재 길이 : ${keyArr.length}`,
      );
    } else if (keyArr.length === 2) {
      const [_, option] = key.split('__');
      where[option] = value;
    } else {
      const [_, option, method] = key.split('__');

      where[option] = MAPPER[method](value);
    }
    return where;
  }
  parseOrderFilter<T>(key: string, value: any): FindOptionsOrder<T> {
    let order: FindOptionsOrder<T> = {};
    const [_, option] = key.split('__');
    order[option] = value;

    return order;
  }
}
