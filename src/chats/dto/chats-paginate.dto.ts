import { IsNumber } from 'class-validator';
import { BasedPaginateDto } from 'src/common/dto/paginate-based.dto';

export class ChatPaginateDto extends BasedPaginateDto {
  @IsNumber()
  take: number = 5;
}
