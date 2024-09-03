/**
 * 지방행정 인허가 데이터를 가져오는 함수
 */

import { DataSourceManager } from './data-source-manager';
import { getUpdatedData } from './get-updated-data';

/**
 * name, address가 같은 데이터를 제거하는 함수
 *
 * @param data
 * @returns
 */
const removeDuplicates = (data) => {
  const uniqueMap = new Map();
  for (const item of data) {
    const key = `${item.name}|${item.address}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  }
  return Array.from(uniqueMap.values());
};

const updateData = async () => {
  const dataSourceManager = DataSourceManager.getInstance();
  await dataSourceManager.initialize();

  const { opened, closed } = await getUpdatedData(dataSourceManager);
  const uniqueOpened = removeDuplicates(opened);
  const uniqueClosed = removeDuplicates(closed);

  const repository = dataSourceManager.getRepository('Restaurant');
  const CHUNK_SIZE = 5000;

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

updateData();

export { updateData };
