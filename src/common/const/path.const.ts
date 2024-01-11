/**
 *
 */

import { join } from 'path';

// 프로젝트 경로
export const PROJECT_ROOT_PTAH = process.cwd();
export const PUBLIC_FOLDER_NAME = 'public';
export const POSTS_FOLDER_NAME = 'posts';

export const PUBLIC_FOLDER_PATH = join(PROJECT_ROOT_PTAH, PUBLIC_FOLDER_NAME);

//파일 저장 root/public/posts
export const POST_IMAGE_PATH = join(PUBLIC_FOLDER_PATH, POSTS_FOLDER_NAME);

//router 경로 /public/posts/
export const POST_ROUTER_IMAGE_PATH = join(
  PUBLIC_FOLDER_NAME,
  POSTS_FOLDER_NAME,
);
