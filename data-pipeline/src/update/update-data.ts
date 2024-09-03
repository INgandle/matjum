import { CHUNK_SIZE } from '../common/common.constants';
import { DataSourceManager } from '../common/data-source-manager';
import { getUpdatedData } from './get-updated-data';
import { ProcessedData } from '../types/processed-data.type';

/**
 * name, address가 같은 데이터를 제거하는 함수
 *
 * @param data
 * @returns
 */
const removeDuplicates = (data: ProcessedData[]): ProcessedData[] => {
  const uniqueMap = new Map();
  for (const item of data) {
    const key = `${item.name}|${item.address}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  }
  return Array.from(uniqueMap.values());
};

/**
 * 변경된 데이터를 업데이트하는 함수.
 * 영업 중인 데이터는 upsert, 폐업한 데이터는 delete 한다.
 */
const updateData = async () => {
  const dataSourceManager = DataSourceManager.getInstance();
  await dataSourceManager.initialize();

  const { opened, closed } = await getUpdatedData(dataSourceManager);
  const uniqueOpened = removeDuplicates(opened);
  const uniqueClosed = removeDuplicates(closed);

  const repository = dataSourceManager.getRepository('Restaurant');

  try {
    for (let i = 0; i < uniqueOpened.length; i += CHUNK_SIZE) {
      const chunk = uniqueOpened.slice(i, i + CHUNK_SIZE);

      const res = await repository.upsert(chunk, {
        conflictPaths: ['name', 'address'],
      });
      console.log(`Updated chunk ${i / CHUNK_SIZE + 1}`);
      console.log(res.identifiers.length);
    }

    for (let i = 0; i < uniqueClosed.length; i += CHUNK_SIZE) {
      const chunk = uniqueClosed.slice(i, i + CHUNK_SIZE);
      const res = await repository.delete({
        name: chunk.map((item) => item.name),
        address: chunk.map((item) => item.address),
      });
      console.log(`Deleted chunk ${i / CHUNK_SIZE + 1}`);
      console.log(res.affected);
    }
  } catch (e) {
    console.error(e);
  }

  dataSourceManager.closeConnection();
};

export { updateData };
