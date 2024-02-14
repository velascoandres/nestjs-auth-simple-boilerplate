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

import { JwtChangeEmailStrategy } from './jwt-change-email.strategy';

describe('JwtStrategy tests', () => {
  let jwtChangeEmailStrategy: JwtChangeEmailStrategy;
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
        JwtChangeEmailStrategy,
        mockConfigService({
          JWT_CHANGE_EMAIL_TOKEN_SECRET: '123',
          JWT_CHANGE_EMAIL_TOKEN_SECRET_EXPIRATION_TIME: '45min',
        }),
        mockEmailService(),
      ],
    }).compile();

    jwtChangeEmailStrategy = module.get<JwtChangeEmailStrategy>(
      JwtChangeEmailStrategy,
    );
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
    expect(jwtChangeEmailStrategy).toBeDefined();
  });

  describe('When validate a user', () => {
    describe('When user is valid', () => {
      it('should return the user', async () => {
        const user = await jwtChangeEmailStrategy.validate({
          email: 'smith@mail.com',
          newEmail: 'smith-updated@mail.com',
        });

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
      });
    });
    describe('When user is null', () => {
      it('should thrown an exception', async () => {
        await expect(
          jwtChangeEmailStrategy.validate({
            email: 'smith-fake@mail.com',
            newEmail: 'smith-updated@mail.com',
          }),
        ).rejects.toThrow(new ForbiddenException('User not found'));
      });
    });
  });
});
