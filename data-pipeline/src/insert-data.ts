import { DataSource } from 'typeorm';

import { databaseOptions } from './common/common.constants';
import { ProcessedData } from './types/processed-data.type';
import { DataSourceManager } from './data-source-manager';

const bulkInsert = async (dataSourceManager: DataSourceManager, data: ProcessedData[]) => {
  const repository = dataSourceManager.getRepository('Restaurant');
  const CHUNK_SIZE = 5000;

  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);
    await repository.createQueryBuilder().insert().into('Restaurant').values(chunk).orIgnore().execute();
    console.log(`Inserted chunk ${i / CHUNK_SIZE + 1}`);
  }
  console.log('All data inserted: ', data.length);
};

// FIXME: insertData
const insertData = async (dataList: ProcessedData[]) => {
  const dataSourceManager = DataSourceManager.getInstance();

  await dataSourceManager.initialize();

  await bulkInsert(dataSourceManager, dataList);

  await dataSourceManager.closeConnection();
};

export { insertData };
