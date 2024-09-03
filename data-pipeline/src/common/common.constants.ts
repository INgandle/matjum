import { config } from 'dotenv';
import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

config();

export const FETCH_OPTION = {
  url: 'http://www.localdata.go.kr/platform/rest/GR0/openDataApi',
  query: {
    authKey: process.env.AUTH_KEY,
    //state: '01', // 영업중
    pageIndex: '1',
    pageSize: '10000', // 개발용 : 500, 운영용 : 10000 max
    resultType: 'json',
  },
};

export const databaseOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: ['./src/entities/*.ts'],
  synchronize: false, // 자꾸 인덱스 없애서 false로 설정
  logging: ['error', 'warn'],
  namingStrategy: new SnakeNamingStrategy(),
};

/**
 * 필요없는 카테고리 리스트
 */
export const excludeCategorySet = new Set([
  '이동조리',
  '출장조리',
  '키즈카페',
  '푸드트럭',
  '관광호텔',
  '편의점',
  '단란주점',
]);

// api 요청하는 지역코드
export const localCodes = {
  서울특별시: '6110000',
  경기도: '6410000',
};
