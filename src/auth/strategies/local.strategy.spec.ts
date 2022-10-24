import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { LocalStrategy } from './local.strategy';

import { mockConfigService } from '../../utils/config-service.mock';
import dbTestingUtils from '../../utils/db-testing.utils';
import { UserEntity } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { AuthService } from '../auth.service';
import usersFixtures from '../fixtures/users.fixtures';
import { UnauthorizedException } from '@nestjs/common';
import { mockEmailService } from '../../utils/auth-service.mock';

describe('LocalStrategy tests', () => {
  let localStrategy: LocalStrategy;
  let dataSource: DataSource;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ...dbTestingUtils.TypeOrmSQLITETestingModule([UserEntity]),
        JwtModule.register({}),
        PassportModule,
        ConfigModule,
      ],
      providers: [
        AuthService,
        UsersService,
        LocalStrategy,
        mockConfigService({
          JWT_ACCESS_SECRET: '123',
          JWT_REFRESH_SECRET: '1234',
          JWT_EXPIRES: '45min',
          JWT_REFRESH_EXPIRES: '1y',
        }),
        mockEmailService(),
      ],
    }).compile();

    localStrategy = module.get<LocalStrategy>(LocalStrategy);
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
    expect(localStrategy).toBeDefined();
  });

  describe('When validate a user', () => {
    it('should return the user', async () => {
      const user = await localStrategy.validate(
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

    it('should thrown an exception', async () => {
      await expect(
        localStrategy.validate('smith@mail.com', 'not-valid-passwod'),
      ).rejects.toThrow(new UnauthorizedException('User not valid'));
    });
  });
});
