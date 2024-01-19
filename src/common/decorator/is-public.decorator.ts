import { SetMetadata, createParamDecorator } from '@nestjs/common';
import { TokenEnum } from 'src/auth/const/token-enum.const';
export const IS_PUBLIC_KEY = 'ispublickey';
export const IsPublic = (token: TokenEnum) => SetMetadata(IS_PUBLIC_KEY, token);
