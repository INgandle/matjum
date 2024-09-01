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

const bulkInsert = async (AppDataSource: DataSource, data: Partial<ProcessedData>[]) => {
  const repository = AppDataSource.getRepository('Restaurant');
  const CHUNK_SIZE = 1000;

  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);

    //// undefined 를 이용해 name, address가 겹치는 경우에 ''이 아닌 필드만 업데이트 한다.
    //await repository.upsert(
    //  chunk.map((record) => ({
    //    name: record.name,
    //    address: record.address,
    //    category: record.category,
    //    location:
    //      record.x && record.y
    //        ? () => `ST_SetSRID(ST_Transform(ST_SetSRID(ST_MakePoint(${record.x}, ${record.y}), 5174), 4326), 4326)`
    //        : undefined,
    //    phoneNumber: record.phoneNumber,
    //    lastModTs: record.lastModTs,
    //  })),
    //  {
    //    conflictPaths: ['name', 'address'], // 만약 chunk 내에서 name, address가 겹치는 경우에는 에러가 남 ㅋㅋㅋ
    //    skipUpdateIfNoValuesChanged: true,
    //  },
    //);

    await repository
      .createQueryBuilder()
      .insert()
      .into('Restaurant')
      .values(
        chunk.map((record) => ({
          name: record.name,
          address: record.address,
          category: record.category,
          location:
            record.x && record.y
              ? () => `ST_SetSRID(ST_Transform(ST_SetSRID(ST_MakePoint(${record.x}, ${record.y}), 5174), 4326), 4326)`
              : undefined,
          phoneNumber: record.phoneNumber,
          lastModTs: record.lastModTs,
        })),
      )
      .orIgnore()
      //.orUpdate(['category', 'location', 'phoneNumber', 'lastModTs'], ['name', 'address'], {
      //  skipUpdateIfNoValuesChanged: true,
      //  upsertType: 'on-conflict-do-update',
      //})
      //.setParameters({
      //  category: (record) => `COALESCE(NULLIF(${record.category}, ''), "Restaurant"."category")`,
      //  location: (record) => `COALESCE(NULLIF(${record.location}, ''), "Restaurant"."location")`,
      //  phoneNumber: (record) => `COALESCE(NULLIF(${record.phoneNumber}, ''), "Restaurant"."phoneNumber")`,
      //})
      .execute();

    console.log(`Inserted chunk ${i / CHUNK_SIZE + 1}`);
  }
  console.log('All data inserted: ', data.length);
};

export const upsertData = async (dataList: Partial<ProcessedData>[]) => {
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
