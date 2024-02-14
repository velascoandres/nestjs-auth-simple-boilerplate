import { DataSource } from 'typeorm';

import { ForbiddenException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { mockEmailService } from '../../test-utils/auth-service.mock';
import { mockConfigService } from '../../test-utils/config-service.mock';
import dbTestingUtils from '../../test-utils/db-testing.utils';
import { RoleEntity } from '../../users/entities/role.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { UserRoleEntity } from '../../users/entities/user-role.entity';
import { UsersService } from '../../users/users.service';
import { AuthService } from '../auth.service';
import usersFixtures from '../fixtures/users.fixtures';

import { LocalStrategy } from './local.strategy';

describe('LocalStrategy tests', () => {
  let localStrategy: LocalStrategy;
  let dataSource: DataSource;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ...dbTestingUtils.TypeOrmTestingModule([
          UserEntity,
          RoleEntity,
          UserRoleEntity,
        ]),
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
    await dbTestingUtils.clearFixtures(dataSource);
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
      ).rejects.toThrow(new ForbiddenException('User not valid'));
    });
  });
});
