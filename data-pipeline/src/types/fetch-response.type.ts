import { RawData } from './raw-data.type';

export type LocalAPIResponse = {
  result: {
    header: {
      paging: {
        pageIndex: number;
        totalCount: number;
        pageSize: number;
      };
      process: {
        code: string;
        message: string;
      };
    };
    body: {
      rows: {
        row: RawData[];
      }[];
    };
  };
};

export type FetchResult = {
  url: URL;
  totalCount: number;
  data: RawData[];
};

export type FetchResultFailed = {
  url: URL;
  err: Error;
};
