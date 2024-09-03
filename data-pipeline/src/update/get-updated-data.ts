import { API_URL, KST_OFFSET, LOCAL_CODES } from '../common/common.constants';
import { DataSourceManager } from '../common/data-source-manager';
import { dataFormatting } from '../common/format-raw-data';
import { FetchResult, LocalAPIResponse } from '../types/fetch-response.type';
import { QueryParam } from '../types/query-param.type';

/**
 * 한국 표준시로 변환, YYYYMMDD 형식으로 반환
 *
 * @param date
 * @returns
 */
const convertDateToKST = (date: Date) => {
  const kstDate = new Date(date.getTime() + KST_OFFSET); // utc기준
  return kstDate.toISOString().slice(0, 10).replace(/-/g, '');
};

/**
 * 가장 최근 업데이트된 데이터의 날짜를 가져온다.
 * 기준 : lastModTs (api 서버에서 업데이트 된 시간)
 *
 * @param dataSourceManager
 * @returns
 */
const getRecentUpdate = async (dataSourceManager: DataSourceManager): Promise<Date> => {
  //db에 접근하여 가장 최근 업데이트된 데이터의 날짜를 가져온다.

  console.time('getRecentUpdate');
  const result = await dataSourceManager
    .getQueryBuilder()
    .select('MAX(restaurant.lastModTs)', 'lastModTs')
    .from('Restaurant', 'restaurant')
    .getRawOne();
  console.timeEnd('getRecentUpdate');

  return result.lastModTs;
};

/**
 * 공공 api로 데이터를 요청한다.
 *
 * @param url 요청한 url의 URL 객체
 * @returns
 */
const fetchData = async (url: URL): Promise<LocalAPIResponse> => {
  // 200 ok , code(00)
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`API request failed: code: ${response.status}, text: ${response.statusText}`);
  }
  return response.json();
};

/**
 * 요청 정보, 진행상황을 로깅하는 함수
 *
 * @param url
 * @param result
 */
const logRequestInfo = (url: URL, result: LocalAPIResponse['result']) => {
  const localCode = url.searchParams.get('localCode');
  const opnSvcId = url.searchParams.get('opnSvcId');
  const pageIndex = +url.searchParams.get('pageIndex');
  console.log(
    `${localCode === '6110000' ? '서울' : '경기'}: ${opnSvcId == '07_24_04_P' ? '일반음식점' : '휴게음식점'}`,
    `${(pageIndex - 1) * 500 + result.body.rows[0].row.length} / ${result.header.paging.totalCount}`,
  );
};

/**
 * baseUrl, queryParam을 받아 fetch 요청하는 Promise를 반환한다.
 * resolve: 성공 시 FetchResult 반환
 * reject: 실패 시 FetchResultFailed throw (재시도를 위한 url)
 *
 * @param baseUrl
 * @param queryParam
 * @returns
 */
const createRequest = async (baseUrl: URL, queryParam?: QueryParam): Promise<FetchResult> => {
  const url = new URL(baseUrl.toString());
  if (queryParam !== undefined) {
    Object.entries(queryParam).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  try {
    const { result }: LocalAPIResponse = await fetchData(url);
    if (result.header.process.code !== '00') {
      throw new Error(`API request failed: ${result.header.process.message}`);
    }
    logRequestInfo(url, result);
    return { url: url, totalCount: result.header.paging.totalCount, data: result.body.rows[0].row };
  } catch (err) {
    throw { url: url, err: err }; // FetchResultFailed
  }
};

const createAdditionalRequests = (value: FetchResult): Promise<FetchResult>[] => {
  const additionalRequests: Promise<FetchResult>[] = [];

  const pageIndex = +value.url.searchParams.get('pageIndex');
  const totalPages = Math.ceil(value.totalCount / 500);
  for (let i = 2; i <= totalPages; i++) {
    const queryParam = new URLSearchParams(value.url.searchParams);
    queryParam.set('pageIndex', i.toString());

    const url = new URL(value.url.toString());
    url.search = queryParam.toString();
    additionalRequests.push(createRequest(url));
  }
  return additionalRequests;
};

/**
 * update된 데이터를 공공 api 요청으로 가져온다.
 *
 * @param dataSourceManager
 * @returns
 */
const getUpdatedData = async (dataSourceManager: DataSourceManager) => {
  const lastModTs = await getRecentUpdate(dataSourceManager);

  // 일반음식점, 휴게음식점
  const opnSvcIdList = ['07_24_04_P', '07_24_05_P'];

  const today = convertDateToKST(new Date());
  // 날짜만 지정할 수 있으므로 (시간은 불가능) 최근 업데이트 된 날짜 당일로 설정
  const lastUpdate = convertDateToKST(lastModTs);

  const url = new URL(API_URL);

  const baseQueryParam = {
    authKey: process.env.API_KEY,
    lastModTsBgn: lastUpdate, // 전 월의 24일까지 가능.
    lastModTsEnd: today,
    pageIndex: '1',
    pageSize: '500', // max -  개발용 : 500, 운영용 : 10000
    resultType: 'json',
  };

  const initialRequests = Object.values(LOCAL_CODES).flatMap((localCode: string) =>
    opnSvcIdList.map((opnSvcId) => createRequest(url, { ...baseQueryParam, localCode, opnSvcId })),
  );

  /**
   * Promise.allSettled를 사용하여 모든 요청이 완료될 때까지 기다린다.
   * 요청이 성공하면 fulfilled, 실패하면 rejected로 상태가 반환된다.
   */
  const results = await Promise.allSettled(initialRequests);

  const successfulResults: FetchResult[] = [];
  const additionalRequests: Promise<FetchResult>[] = [];

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      const { value } = result;
      // 500개 이상일 때 추가 요청
      if (value.totalCount > 500) {
        additionalRequests.push(...createAdditionalRequests(result.value));
      }
      successfulResults.push(value);
    } else {
      const { url, err } = result.reason;
      console.error(url, err);
    }
  });

  const additionalResults = await Promise.allSettled(additionalRequests);
  additionalResults.forEach((result) => {
    if (result.status === 'fulfilled') {
      successfulResults.push(result.value);
    } else {
      const { url, err } = result.reason;
      console.error(url, err);
    }
  });

  return dataFormatting(successfulResults.flatMap((result) => result.data));
};

export { getUpdatedData };
