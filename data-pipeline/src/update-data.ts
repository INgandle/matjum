/**
 * 지방행정 인허가 데이터를 가져오는 함수
 */

import { DataSourceManager } from './data-source-manager';
import { getUpdatedData } from './get-updated-data';

const updateData = async () => {
  const dataSourceManager = DataSourceManager.getInstance();
  await dataSourceManager.initialize();

  const { opened, closed } = await getUpdatedData(dataSourceManager);

  const repository = dataSourceManager.getRepository('Restaurant');
  const CHUNK_SIZE = 5000;

  for (let i = 0; i < opened.length; i += CHUNK_SIZE) {
    const chunk = opened.slice(i, i + CHUNK_SIZE);

    await repository.upsert(chunk, {
      conflictPaths: ['name', 'address'],
    });
    console.log(`Inserted chunk ${i / CHUNK_SIZE + 1}`);
  }

  for (let i = 0; i < opened.length; i += CHUNK_SIZE) {
    const chunk = opened.slice(i, i + CHUNK_SIZE);
    await repository.delete({
      name: chunk.map((item) => item.name),
      address: chunk.map((item) => item.address),
    });
    console.log(`Inserted chunk ${i / CHUNK_SIZE + 1}`);
  }

  //const results = await processWithQueue(requests, 10);

  //console.log('\n=============================================================\nDone: ', results.length);
};

updateData();

export { updateData };
