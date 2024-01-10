import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class BasedPaginateDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order__createAt: 'ASC' | 'DESC' = 'ASC';

  @IsNumber()
  @IsOptional()
  where__id__more_than?: number;

  @IsNumber()
  @IsOptional()
  where__id__less_than?: number;

  @IsNumber()
  take: number = 20;
}
