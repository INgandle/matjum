import { RawData } from './raw-data.type';

export type APIResponse = {
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
