import { DataSource, EntityTarget, Repository } from 'typeorm';

import { DATABASE_OPTION } from './common.constants';

/**
 * Data source 관리 클래스
 * Singleton 패턴으로 구현
 */
export class DataSourceManager {
  private static instance: DataSourceManager;
  private dataSource: DataSource;

  private constructor() {
    this.dataSource = new DataSource(DATABASE_OPTION);
  }

  public static getInstance(): DataSourceManager {
    if (!DataSourceManager.instance) {
      DataSourceManager.instance = new DataSourceManager();
    }
    return DataSourceManager.instance;
  }

  public async initialize(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      try {
        await this.dataSource.initialize();
      } catch (e) {
        console.table(e);
        console.error(e);
        if (e.code === 'ENOTFOUND') {
          console.error('Please check the database connection options in the .env file.\n');
        }
        await this.dataSource.destroy();
        process.exit(1);
      }
      console.log('Data Source has been initialized!');
    }
  }

  public getRepository<T>(entity: EntityTarget<T>): Repository<T> {
    return this.dataSource.getRepository(entity);
  }

  public getQueryBuilder() {
    return this.dataSource.createQueryBuilder();
  }

  public async closeConnection(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      console.log('Data Source connection has been closed.');
    }
  }
}
