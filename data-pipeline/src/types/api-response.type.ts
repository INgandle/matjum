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
