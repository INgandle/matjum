/**
 * 지방행정 인허가 데이터를 가져오는 함수
 */

import { DataSource } from 'typeorm';
import { localCodes } from './common/common.constants';
import { Restaurant } from './entities/restaurant.entity';
import { createDataSource } from './insert-data';
import { APIResponse } from './types/api-response.type';
import { QueryParam } from './types/query-param.type';

/**
 * 한국 표준시로 변환, YYYYMMDD 형식으로 반환
 *
 * @param date
 * @returns
 */
const convertDateToKST = (date: Date) => {
  const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000); // utc기준

  console.log(kstDate);

  // UTC 없으면 다 kst로 나옴
  // 없어도 작동은 하지만 서버에 올릴 때 어떻게 될 지 모르므로 변환과정을 거침.
  const year = kstDate.getUTCFullYear();
  const month = String(kstDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(kstDate.getUTCDate()).padStart(2, '0');

  return `${year}${month}${day}`;
};

/**
 * 가장 최근 업데이트된 데이터의 날짜를 가져온다.
 * 기준 : lastModTs (api 서버에서 업데이트 된 시간)
 *
 * @param dataSource
 * @returns
 */
const getRecentUpdate = async (dataSource: DataSource) => {
  //db에 접근하여 가장 최근 업데이트된 데이터의 날짜를 가져온다.

  console.time('getRecentUpdate');
  const result = await dataSource
    .createQueryBuilder()
    .select('MAX(restaurant.lastModTs)', 'lastModTs')
    .from(Restaurant, 'restaurant')
    .getRawOne();
  console.timeEnd('getRecentUpdate');

  return result.lastModTs;
};

const createRequest = async (
  url: string,
  baseQueryParams: Omit<QueryParam, 'localCode' | 'opnSvcId'>,
  localCode: number,
  opnSvcId: string,
) => {
  const queryParams = { ...baseQueryParams, localCode, opnSvcId };
  try {
    const data: APIResponse = await fetchData(url, queryParams);
    if (data.result.header.process.code !== '00') {
      throw new Error(`API request failed: ${data.result.header.process.message}`);
    }
    console.log(JSON.stringify(data.result.header));
    console.log(
      queryParams.localCode === 6110000 ? '서울 :' : '경기 :',
      queryParams.opnSvcId === '07_24_04_P' ? '일반음식점' : '휴게음식점',
      data.result.header.paging.totalCount,
    );
    if (data.result.header.paging.totalCount > 500) {
      // 나머지 데이터 가져오기 위해 어딘가에 push
    }

    return {
      url: url,
      totalCount: data.result.header.paging.totalCount,
      data: data.result.body.rows[0].row,
    };
  } catch (e) {
    return { e: e as Error };
  }
};
/**
 *
 * @param url \
 * @param queryParams
 * @returns
 */
const fetchData = async (url: string, queryParams): Promise<APIResponse> => {
  const params = new URLSearchParams(queryParams);
  const fullUrl = `${url}?${params}`;

  // 200 ok , code(00)
  const response = await fetch(fullUrl);
  return response.json();
};

const updateData = async () => {
  const dataSource = await createDataSource();
  const lastModTs = await getRecentUpdate(dataSource);

  // 일반음식점, 휴게음식점
  const opnSvcIdList = ['07_24_04_P', '07_24_05_P'];
  // 한국 오늘 날짜

  const today = convertDateToKST(new Date());
  // 시간을 정할 수 없으므로 최근 업데이트 된 날짜 당일로 설정
  const lastUpdate = convertDateToKST(lastModTs);

  const url = 'http://www.localdata.go.kr/platform/rest/GR0/openDataApi';
  const localCodeArray = Object.values(localCodes);

  const baseQueryParams: Omit<QueryParam, 'localCode' | 'opnSvcId'> = {
    authKey: process.env.API_KEY,
    lastModTsBgn: lastUpdate, // 전 월의 24일까지 가능.
    lastModTsEnd: today,
    state: '01', // 영업중
    pageIndex: '1',
    pageSize: '500', // 개발용 : 500, 운영용 : 10000 max
    resultType: 'json',
  };

  const requests = localCodeArray.flatMap((localCode) =>
    opnSvcIdList.map((opnSvcId) => createRequest(url, baseQueryParams, localCode, opnSvcId)),
  );

  const res = await Promise.all(requests);
  console.log(res);

  //const results = await processWithQueue(requests, 10);

  //console.log('\n=============================================================\nDone: ', results.length);
};

updateData();

export { updateData };
