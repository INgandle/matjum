import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import seeder from './seeds/seeder';

config();

// seeding 10 companies
(async () => {
  console.log('Seeding data...');
  if (process.argv[2] === undefined) {
    console.log('Please enter the number of users to be created.');
    console.log('ex) npm run seed 300\n');
    process.exit(1);
  }

  const options: DataSourceOptions = {
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    synchronize: true,
    entities: ['./src/entities/*.ts'],
    namingStrategy: new SnakeNamingStrategy(),
    logging: true,
  };

  const dataSource: DataSource = new DataSource(options);

  try {
    await dataSource.initialize();
  } catch (e) {
    console.table(e);
    console.error(e);
    if (e.code === 'ENOTFOUND') {
      console.error('Please check the database connection options in the .env file.\n');
    }
    await dataSource.destroy();
    process.exit(1);
  }
  try {
    const result = await seeder(dataSource);
    result.map((r, i) => console.log(`Created ${r} ${['members', 'restaurants', 'reviews'][i]}`));
  } catch (e) {
    console.error(e);
    if (e.code === '23505') {
      // already exists
      console.error('\nSeeding data already exists.\n');
    }
    await dataSource.destroy();
    process.exit(1);
  }
  await dataSource.destroy();
})();
