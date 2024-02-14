import { DataSource, EntityTarget, ObjectLiteral } from 'typeorm';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

interface IFixture {
  entity: EntityTarget<ObjectLiteral>;
  data: Record<string, unknown>[];
}

const TypeOrmTestingModule = (entities: any[]) => [
  ConfigModule.forRoot({
    envFilePath: '.env',
    isGlobal: true,
  }),
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => {
      return {
        type: 'postgres',
        autoLoadEntities: true,
        url: configService.get('POSTGRES_TEST_URL'),
        synchronize: true,
        dropSchema: true,
        entities: entities,
      };
    },
    inject: [ConfigService],
  }),
  TypeOrmModule.forFeature(entities),
];

const loadFixtures = async (
  dataSource: DataSource,
  fixtures: Record<string, IFixture>,
) => {
  const entityManager = dataSource.createEntityManager();

  for (const { entity, data } of Object.values(fixtures)) {
    await entityManager.insert(entity, data);
  }
};

const clearFixtures = async (dataSource: DataSource) => {
  const entityManager = dataSource.createEntityManager();

  const connection = entityManager.connection;

  try {
    const entities = connection.entityMetadatas;
    const tableNames = entities
      .map((entity) => `"${entity.tableName}"`)
      .join(', ');

    await connection.query(`TRUNCATE ${tableNames} RESTART IDENTITY CASCADE`);
  } catch (error) {
    throw new Error(`ERROR: Cleaning test database: ${error}`);
  }
};

const closeConn = async (dataSource: DataSource) => {
  await dataSource.createEntityManager().connection.destroy();
};

export default {
  TypeOrmTestingModule,
  loadFixtures,
  clearFixtures,
  closeConn,
};
