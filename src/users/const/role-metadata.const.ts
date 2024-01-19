import { SetMetadata } from '@nestjs/common';
import { RolesEnum } from './enum.const';

export const ROLES_KEY = 'user_key';
export const Role = (role: RolesEnum) => SetMetadata(ROLES_KEY, role);
