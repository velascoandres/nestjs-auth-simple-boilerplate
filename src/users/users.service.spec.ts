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
  describe('When create user', () => {
    it('should create a user with hashed password', async () => {
      const user = {
        firstname: 'fistname1',
        lastname: 'lastname1',
        email: 'mail1@test.com',
        password: 'password12345',
      } as CreateUserDTO;

      const createdUser = await service.createUser(user);
      expect(createdUser).toStrictEqual(
        expect.objectContaining({
          id: 3,
          firstname: 'fistname1',
          lastname: 'lastname1',
          email: 'mail1@test.com',
          password: expect.stringContaining('$argon2id$v=19$m=65536,t=3,p=4'),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );
    });

    it('should create a user with to lower case email', async () => {
      const user = {
        firstname: 'fistname1',
        lastname: 'lastname1',
        email: 'MAIL1@TEST.COM',
        password: 'password12345',
      } as CreateUserDTO;

      const createdUser = await service.createUser(user);
      expect(createdUser).toStrictEqual(
        expect.objectContaining({
          firstname: 'fistname1',
          lastname: 'lastname1',
          email: 'mail1@test.com',
          password: expect.stringContaining('$argon2id$v=19$m=65536,t=3,p=4'),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );
    });
  });

  describe('When create a user with duplicate email', () => {
    it('should thrown an error', async () => {
      const user = {
        firstname: 'fistname1',
        lastname: 'lastname1',
        email: 'jorge@mail.com',
        password: 'password12345',
      } as CreateUserDTO;

      const messagePattern = new RegExp(/email/s);
      await expect(service.createUser(user)).rejects.toThrowError(
        messagePattern,
      );
    });
  });

  describe('When count users', () => {
    it('should count users', async () => {
      const count = await service.countUsers();

      expect(count).toBe(userFixtures.user.data.length);
    });
  });

  describe('When find a user by email', () => {
    it('should return a user', async () => {
      const user = await service.findUserByEmail('jorge@mail.com');

      expect(user).toStrictEqual(
        expect.objectContaining({
          id: 1,
          firstname: 'Jorge',
          lastname: 'Ramirez',
          email: 'jorge@mail.com',
          password: 'sha1231',
        }),
      );
    });

    it('should return a null', async () => {
      const user = await service.findUserByEmail('james.web@mail.com');

      expect(user).toBeNull();
    });
  });
});
