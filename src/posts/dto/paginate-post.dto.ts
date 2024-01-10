import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { BasedPaginateDto } from 'src/common/dto/paginate-based.dto';

export class paginateDto extends BasedPaginateDto {
  // @IsNumber()
  // @IsOptional()
  // where__likeCount__more_than: number;
}
