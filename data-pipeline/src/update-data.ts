/**
 * 지방행정 인허가 데이터를 가져오는 함수
 */

import { DataSource } from 'typeorm';
import { localCodes } from './common/common.constants';
import { Restaurant } from './entities/restaurant.entity';
import { createDataSource } from './insert-data';
import { APIResponse } from './types/api-response.type';

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
 * @param url \
 * @param queryParams
 * @returns
 */
const fetchData = async (url: string, queryParams) => {
  const params = new URLSearchParams(queryParams); // 헐 이런게;;
  const fullUrl = `${url}?${params}`;

  console.log(fullUrl);

  // 200 ok , code(00)
  const response = await fetch(fullUrl);
  const data = await response.json();

  return data;
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

  const regionCodeArray = Object.entries(localCodes).flatMap(([province, districts]) =>
    Object.entries(districts).map(([district, code]) => ({ province, district, code })),
  );

  const url = 'http://www.localdata.go.kr/platform/rest/GR0/openDataApi';

  const baseQueryParams = {
    authKey: process.env.API_KEY,
    //localCode: '3010000', // 서울, 경기 (시군구 돌면서 차례로..)
    lastModTsBgn: lastUpdate, // 전 월의 24일까지 가능.
    lastModTsEnd: today,
    state: '01', // 영업중
    pageIndex: '1',
    pageSize: '500', // 개발용 : 500, 운영용 : 10000 max
    resultType: 'json',
    //opnSvcId: '07_24_04_P',
  };

  const requests = regionCodeArray.flatMap((region) =>
    opnSvcIdList.map((opnSvcId) => {
      const queryParams = {
        ...baseQueryParams,
        localCode: region.code,
        opnSvcId: opnSvcId,
      };

      return fetchData(url, queryParams)
        .then((data: APIResponse) => {
          console.log(data);
          if (data.result.header.process.code !== '00') {
            throw new Error(`API request failed: ${data.result.header.process.message}`);
          }
          return { totalCount: data.result.header.paging.totalCount, data: data.result.body.rows.row };
        })
        .catch((e) => ({
          e,
        }));
    }),
  );
  let results = [];
  results = await Promise.all(requests); // 뭔가 문제 생김;
  //for (let i = 0; i < requests.length; i++) {
  //  const result = await requests[i];
  //  console.log(result);
  //  console.log('done: ' + i);
  //}
};

updateData();

export { updateData };
