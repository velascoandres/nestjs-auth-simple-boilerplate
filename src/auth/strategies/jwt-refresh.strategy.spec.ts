import { Request } from 'express';
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
import { IAuthUser } from '../types/auth-user';

import { JwtRefreshStrategy } from './jwt-refresh.strategy';

describe('LocalStrategy tests', () => {
  let jwtRefreshStrategy: JwtRefreshStrategy;
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
        JwtRefreshStrategy,
        mockConfigService({
          JWT_REFRESH_SECRET: '1234',
          JWT_REFRESH_EXPIRES: '1y',
        }),
        mockEmailService(),
      ],
    }).compile();

    jwtRefreshStrategy = module.get<JwtRefreshStrategy>(JwtRefreshStrategy);
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
    expect(jwtRefreshStrategy).toBeDefined();
  });

  describe('When validate a user', () => {
    const requestMock = {
      get: jest.fn(() => 'Bearer some-token'),
    } as unknown as Request;

    it('should return the user with refresh token', async () => {
      const authUserMock = { id: 4 } as IAuthUser;

      const user = await jwtRefreshStrategy.validate(requestMock, authUserMock);

      expect(user).toStrictEqual(
        expect.objectContaining({
          id: 4,
          email: 'reby@mail.com',
          firstname: 'Reby',
          lastname: 'Sanchez',
          isActive: true,
          emailVerified: true,
          refreshToken: 'some-token',
        }),
      );

      expect(user).not.toHaveProperty('password');
    });

    it('should thrown an exception', async () => {
      const authUserMock = { id: 40 } as IAuthUser;

      await expect(
        jwtRefreshStrategy.validate(requestMock, authUserMock),
      ).rejects.toThrow(new ForbiddenException('User not valid'));
    });
  });
});
