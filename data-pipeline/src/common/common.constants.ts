import { config } from 'dotenv';
import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

config();

export const SEOUL_API_OPTIONS = {
  host: 'http://openapi.seoul.go.kr:8088/',
  key: process.env.SEOUL_API_KEY,
  dataType: 'json',
  service: 'LOCALDATA_072404',
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
  logging: true,
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
  서울특별시: {
    종로구: '3010000',
    중구: '3020000',
    용산구: '3030000',
    성동구: '3040000',
    광진구: '3050000',
    동대문구: '3060000',
    중랑구: '3070000',
    성북구: '3080000',
    강북구: '3090000',
    도봉구: '3100000',
    노원구: '3110000',
    은평구: '3120000',
    서대문구: '3130000',
    마포구: '3140000',
    양천구: '3150000',
    강서구: '3160000',
    구로구: '3170000',
    금천구: '3180000',
    영등포구: '3190000',
    동작구: '3200000',
    관악구: '3210000',
    서초구: '3220000',
    강남구: '3230000',
    송파구: '3240000',
    강동구: '3250000',
  },
  경기도: {
    수원시: '3740000',
    성남시: '3780000',
    의정부시: '3820000',
    안양시: '3830000',
    부천시: '3860000',
    광명시: '3900000',
    평택시: '3910000',
    동두천시: '3920000',
    안산시: '3930000',
    고양시: '3940000',
    과천시: '3970000',
    구리시: '3980000',
    남양주시: '3990000',
    오산시: '4000000',
    시흥시: '4010000',
    군포시: '4020000',
    의왕시: '4030000',
    하남시: '4040000',
    용인시: '4050000',
    파주시: '4060000',
    이천시: '4070000',
    안성시: '4080000',
    김포시: '4090000',
    연천군: '4140000',
    가평군: '4160000',
    양평군: '4170000',
    화성시: '5530000',
    광주시: '5540000',
    양주시: '5590000',
    포천시: '5600000',
    여주시: '5700000',
  },
};
