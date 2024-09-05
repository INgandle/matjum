import { CHUNK_SIZE } from '../common/common.constants';
import { DataSourceManager } from '../common/data-source-manager';
import { ProcessedData } from '../types/processed-data.type';
import { processingRawXML } from './processing-raw-xml';

/**
 * 5000개씩 끊어서 데이터를 insert
 *
 * @param dataSourceManager
 * @param data
 */
const chunkedInsert = async (dataSourceManager: DataSourceManager, data: ProcessedData[]): Promise<void> => {
  const repository = dataSourceManager.getRepository('Restaurant');

  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);
    await repository.createQueryBuilder().insert().into('Restaurant').values(chunk).orIgnore().execute();
    console.log(`Inserted chunk ${i / CHUNK_SIZE + 1}`);
  }
  console.log('All data inserted: ', data.length);
};

/**
 * 초기 data를 insert하는 함수
 *
 */
const insertData = async (): Promise<void> => {
  const dataSourceManager = DataSourceManager.getInstance();

  await dataSourceManager.initialize();

  const data = await processingRawXML();

  await chunkedInsert(dataSourceManager, data);

  await dataSourceManager.closeConnection();
};

insertData();

export { insertData };
