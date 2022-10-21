import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import dbTestingUtils from '../utils/db-testing.utils';
import { AuthService } from './auth.service';
import usersFixtures from './fixtures/users.fixtures';

describe('AuthService', () => {
  let service: AuthService;
  let dataSource: DataSource;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [...dbTestingUtils.TypeOrmSQLITETestingModule([UserEntity])],
      providers: [AuthService, UsersService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(() => {
    module.close();
  });

  beforeEach(async () => {
    await dbTestingUtils.loadFixtures(dataSource, usersFixtures);
  });

  afterEach(async () => {
    await dbTestingUtils.clearFixtures(dataSource, usersFixtures);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('When validate user with email and password', () => {
    it('should return the user if credentials are right', async () => {
      const user = await service.validateUser(
        'smith@mail.com',
        'password12345',
      );

      expect(user).toStrictEqual(
        expect.objectContaining({
          id: 1,
          email: 'smith@mail.com',
          firstname: 'Max',
          lastname: 'Smith',
          isActive: true,
          emailVerified: true,
        }),
      );

      expect(user).not.toHaveProperty('password');
    });

    it('should return null if credentials are wrong', async () => {
      const user = await service.validateUser(
        'smith@mail.com',
        'password123452',
      );

      expect(user).toBe(null);
    });

    it('should return null if user is inactive', async () => {
      const user = await service.validateUser(
        'sanchezr@mail.com',
        'password12345',
      );

      expect(user).toBe(null);
    });

    it('should return null if user email has not been verified', async () => {
      const user = await service.validateUser(
        'rebecca@mail.com',
        'password12345',
      );

      expect(user).toBe(null);
    });
  });
});
