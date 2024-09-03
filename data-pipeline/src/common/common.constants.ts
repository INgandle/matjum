import { config } from 'dotenv';
import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

config();

export const DATABASE_OPTION: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // 자꾸 인덱스 없애서 false로 설정
  logging: ['error', 'warn'],
  namingStrategy: new SnakeNamingStrategy(),
};

export const CHUNK_SIZE = 5000;

/**
 * 필요없는 카테고리 리스트
 */
export const EXCLUDE_CATEGORY_SET = new Set([
  '이동조리',
  '출장조리',
  '키즈카페',
  '푸드트럭',
  '관광호텔',
  '편의점',
  '단란주점',
]);

// api 요청하는 지역코드
export const LOCAL_CODES = {
  서울특별시: '6110000',
  경기도: '6410000',
};

export const OPN_SVC_ID_LIST = ['07_24_04_P', '07_24_05_P'];

export const API_URL = 'http://www.localdata.go.kr/platform/rest/GR0/openDataApi';

export const KST_OFFSET = 9 * 60 * 60 * 1000;
