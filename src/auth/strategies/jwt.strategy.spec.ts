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
import { AuthEmailService } from '../auth-email.service';
import usersFixtures from '../fixtures/users.fixtures';

import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy tests', () => {
  let jwtStrategy: JwtStrategy;
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
        AuthEmailService,
        UsersService,
        JwtStrategy,
        mockConfigService({
          JWT_ACCESS_SECRET: '123',
          JWT_EXPIRES: '45min',
        }),
        mockEmailService(),
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
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
    expect(jwtStrategy).toBeDefined();
  });

  describe('When validate a user', () => {
    describe('When user is valid', () => {
      it('should return the user', async () => {
        const authUser = {
          id: 1,
          email: 'smith@mail.com',
          firstname: 'Max',
          lastname: 'Smith',
          isActive: true,
          emailVerified: true,
          roles: [],
        };

        const user = await jwtStrategy.validate(authUser);

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
    });
    describe('When user is null', () => {
      it('should thrown an exception', async () => {
        const authUser = {
          id: 5,
          firstname: 'Jay',
          lastname: 'Robertson',
          email: 'jay@mail.com',
          isActive: false,
          emailVerified: false,
          roles: [],
        };
        await expect(jwtStrategy.validate(authUser)).rejects.toThrow(
          new ForbiddenException('User not valid'),
        );
      });
    });
  });
});
