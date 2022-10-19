import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import dbTestingUtils from '../utils/db-testing.utils';
import { UserEntity } from './entities/user.entity';
import userFixtures from './fixtures/users.fixtures';
import { DataSource } from 'typeorm';
import { CreateUserDTO } from './dtos/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let dataSource: DataSource;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [...dbTestingUtils.TypeOrmSQLITETestingModule([UserEntity])],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(() => {
    module.close();
  });

  beforeEach(async () => {
    await dbTestingUtils.loadFixtures(dataSource, userFixtures);
  });

  afterEach(async () => {
    await dbTestingUtils.clearFixtures(dataSource, userFixtures);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('When create users', () => {
    it('should create a user', async () => {
      const user = {
        firstname: 'fistname1',
        lastname: 'lastname1',
        email: 'mail1@test.com',
        password: 'sha123132',
      } as CreateUserDTO;

      const createdUser = await service.createUser(user);
      expect(createdUser).toStrictEqual(
        expect.objectContaining({
          id: 3,
          firstname: 'fistname1',
          lastname: 'lastname1',
          email: 'mail1@test.com',
          password: 'sha123132',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );
    });
  });

  describe('When count users', () => {
    it('should count users', async () => {
      const count = await service.countUsers();

      expect(count).toBe(userFixtures.user.data.length);
    });
  });
});
