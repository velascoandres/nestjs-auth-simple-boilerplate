import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';

import { mockConfigService } from '../../utils/config-service.mock';
import dbTestingUtils from '../../utils/db-testing.utils';
import { UserEntity } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import usersFixtures from '../fixtures/users.fixtures';
import { ForbiddenException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AuthEmailService } from '../auth-email.service';
import { mockEmailService } from '../../utils/auth-service.mock';
import { JwtChangeEmailStrategy } from './jwt-change-email.strategy';

describe('JwtStrategy tests', () => {
  let jwtChangeEmailStrategy: JwtChangeEmailStrategy;
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
    await dbTestingUtils.clearFixtures(dataSource, usersFixtures);
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
