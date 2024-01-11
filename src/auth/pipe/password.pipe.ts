import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

//비밀번호 제한

@Injectable()
export class PasswordLenth implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value.toString().length > 8) {
      throw new BadRequestException('8자리 이하를 입력해주세요');
    }
    return value.toString();
  }
}

@Injectable()
export class MaxLengthPassword implements PipeTransform {
  constructor(
    private readonly length: number,
    private readonly subject: string,
  ) {}
  transform(value: any, metadata: ArgumentMetadata) {
    if (value.toString().length > this.length) {
      throw new BadRequestException(
        `${this.subject}의 ${this.length}이하 자리로 만들어주세요`,
      );
    }
    return value.toString();
  }
}

@Injectable()
export class MinLengthPassword implements PipeTransform {
  constructor(
    private readonly length: number,
    private readonly subject: string,
  ) {}
  transform(value: any, metadata: ArgumentMetadata) {
    if (value.toString().length < this.length) {
      throw new BadRequestException(
        `${this.subject}의 ${this.length}자리 이상으로 만들어주세요`,
      );
    }
    return value.toString();
  }
}
