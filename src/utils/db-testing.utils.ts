import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, EntityTarget, ObjectLiteral } from 'typeorm';

interface IFixture {
  entity: EntityTarget<ObjectLiteral>;
  data: Record<string, unknown>[];
}

const TypeOrmSQLITETestingModule = (entities: any[]) => [
  TypeOrmModule.forRoot({
    type: 'better-sqlite3',
    database: ':memory:',
    dropSchema: true,
    entities: entities,
    synchronize: true,
  }),
  TypeOrmModule.forFeature(entities),
];

const loadFixtures = async (
  dataSource: DataSource,
  fixtures: Record<string, IFixture>,
) => {
  const entityManager = dataSource.createEntityManager();

  const createResults = [];

  for (const { entity, data } of Object.values(fixtures)) {
    createResults.push(entityManager.getRepository(entity).save(data));
  }

  await Promise.all(createResults);
};

const clearFixtures = async (
  dataSource: DataSource,
  fixtures: Record<string, IFixture>,
) => {
  const entityManager = dataSource.createEntityManager();

  for (const { entity } of Object.values(fixtures)) {
    await entityManager.getRepository(entity).clear();
  }
};

export default {
  TypeOrmSQLITETestingModule,
  loadFixtures,
  clearFixtures,
};
