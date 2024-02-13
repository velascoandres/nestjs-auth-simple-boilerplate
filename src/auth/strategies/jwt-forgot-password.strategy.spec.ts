import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';

import { mockConfigService } from '../../test-utils/config-service.mock';
import dbTestingUtils from '../../test-utils/db-testing.utils';
import { UserEntity } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import usersFixtures from '../fixtures/users.fixtures';
import { ForbiddenException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AuthEmailService } from '../auth-email.service';
import { mockEmailService } from '../../test-utils/auth-service.mock';
import { JwtForgotPasswordStrategy } from './jwt-forgot-password.strategy';
import { RoleEntity } from '../../users/entities/role.entity';
import { UserRoleEntity } from '../../users/entities/user-role.entity';

describe('JwtStrategy tests', () => {
  let jwtForgotPasswordStrategy: JwtForgotPasswordStrategy;
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
        JwtForgotPasswordStrategy,
        mockConfigService({
          JWT_FORGOT_PASSWORD_TOKEN_SECRET: '123',
          JWT_FORGOT_PASSWORD_TOKEN_EXPIRATION_TIME: '45min',
        }),
        mockEmailService(),
      ],
    }).compile();

    jwtForgotPasswordStrategy = module.get<JwtForgotPasswordStrategy>(
      JwtForgotPasswordStrategy,
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
    expect(jwtForgotPasswordStrategy).toBeDefined();
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
        };

        const user = await jwtForgotPasswordStrategy.validate(authUser);

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
        const authUser = {
          id: 5,
          firstname: 'Jay',
          lastname: 'Robertson',
          email: 'jay-mail@mail.com',
          isActive: false,
          emailVerified: false,
        };
        await expect(
          jwtForgotPasswordStrategy.validate(authUser),
        ).rejects.toThrow(new ForbiddenException('User not found'));
      });
    });
  });
});
