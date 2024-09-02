/**
 * 지방행정 인허가 데이터를 가져오는 함수
 */

import { DataSource } from 'typeorm';
import { FETCH_OPTION, localCodes } from './common/common.constants';
import { Restaurant } from './entities/restaurant.entity';
import { createDataSource } from './insert-data';
import { APIResponse } from './types/api-response.type';
import { RawData } from './types/raw-data.type';
import { dataFormatting } from './format-raw-data';
import { ProcessedData } from './types/processed-data.type';

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

/**
 *
 * @param url
 * @param queryParams
 * @returns
 */
const fetchData = async (url: string, queryParams): Promise<APIResponse> => {
  const params = new URLSearchParams(queryParams);
  const fullUrl = `${url}?${params}`;
  console.log(fullUrl);

  // 200 ok , code(00)
  const response = await fetch(fullUrl);
  return response.json();
};

const createRequest = async (url: string, baseQueryParams, localCode: number, opnSvcId: string) => {
  const queryParams = { ...baseQueryParams, localCode, opnSvcId };
  const data: APIResponse = await fetchData(url, queryParams);
  if (data.result.header.process.code !== '00') {
    throw new Error(`API request failed: ${data.result.header.process.message}`);
  }
  console.log(
    queryParams.localCode === 6110000 ? '서울 :' : '경기 :',
    queryParams.opnSvcId === '07_24_04_P' ? '일반음식점' : '휴게음식점',
    data.result.header.paging.totalCount,
  );
  return {
    url: url,
    totalCount: data.result.header.paging.totalCount,
    data: data.result.body.rows[0].row,
  };
};

/*
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createRequestWithRetry = async (
  url: string,
  baseQueryParams: any,
  localCode: number,
  opnSvcId: string,
  maxRetries: number = 3,
  retryDelay: number = 3000,
) => {
  const queryParams = { ...baseQueryParams, localCode, opnSvcId };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const data: APIResponse = await fetchData(url, queryParams);

      if (data.result.header.process.code !== '00') {
        throw new Error(`API request failed: ${data.result.header.process.message}`);
      }

      console.log(
        queryParams.localCode === 6110000 ? '서울 :' : '경기 :',
        queryParams.opnSvcId === '07_24_04_P' ? '일반음식점' : '휴게음식점',
        data.result.header.paging.totalCount,
      );

      return {
        url: url,
        totalCount: data.result.header.paging.totalCount,
        data: data.result.body.rows[0].row,
      };
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        console.error('Max retries reached. Throwing error.');
        throw error;
      }

      console.log(`Retrying in ${retryDelay}ms...`);
      await delay(retryDelay);
      // 선택적: 재시도 간격을 점진적으로 증가시킬 수 있습니다.
      // retryDelay *= 2;
    }
  }
};
*/

type FetchResult = {
  url: string;
  totalCount: number;
  data: any[];
};

/**
 * API에서 받아온 데이터를 db에 업데이트
 */
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

  const baseQueryParams = {
    authKey: process.env.API_KEY,
    lastModTsBgn: lastUpdate, // 전 월의 24일까지 가능.
    lastModTsEnd: today,
    pageIndex: '1',
    pageSize: '500', // 개발용 : 500, 운영용 : 10000 ma
    resultType: 'json',
  };

  const requests = localCodeArray.flatMap((localCode) =>
    opnSvcIdList.map((opnSvcId) => createRequest(url, baseQueryParams, localCode, opnSvcId)),
  );

  /**
   * Promise.allSettled를 사용하여 모든 요청이 완료될 때까지 기다린다.
   * 요청이 성공하면 fulfilled, 실패하면 rejected로 상태가 반환된다.
   */
  const results = await Promise.allSettled(requests);

  const successfulResults = results
    .filter((result): result is PromiseFulfilledResult<FetchResult> => result.status === 'fulfilled')
    .map((result) => result.value);

  const [opened, closed] = dataFormatting(successfulResults.flatMap((result) => result.data));
  console.log('opened:', opened.length, 'closed:', closed.length);

  //const results = await processWithQueue(requests, 10);

  //console.log('\n=============================================================\nDone: ', results.length);
  dataSource.destroy();
};

updateData();

export { updateData };
