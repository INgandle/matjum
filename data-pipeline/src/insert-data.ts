import { DataSource } from 'typeorm';

import { databaseOptions } from './common/common.constants';
import { ProcessedData } from './types/processed-data.type';

const createDataSource = async () => {
  const dataSource: DataSource = new DataSource(databaseOptions);

  try {
    return dataSource.initialize();
  } catch (e) {
    console.table(e);
    console.error(e);
    if (e.code === 'ENOTFOUND') {
      console.error('Please check the database connection options in the .env file.\n');
    }
    await dataSource.destroy();
    process.exit(1);
  }
};

const bulkInsert = async (AppDataSource: DataSource, data: ProcessedData[]) => {
  const repository = AppDataSource.getRepository('Restaurant');
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
  const dataSource = await createDataSource();

  try {
    await bulkInsert(dataSource, dataList);
  } catch (e) {
    console.error(e);
    await dataSource.destroy();
    process.exit(1);
  }
  await dataSource.destroy();
};

export { createDataSource, insertData };
