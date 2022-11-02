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
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from '../auth.service';
import { AuthEmailService } from '../auth-email.service';
import { mockEmailService } from '../../utils/auth-service.mock';

describe('JwtStrategy tests', () => {
  let jwtStrategy: JwtStrategy;
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
        JwtStrategy,
        mockConfigService({
          JWT_ACCESS_SECRET: '123',
          JWT_REFRESH_SECRET: '1234',
          JWT_EXPIRES: '45min',
          JWT_REFRESH_EXPIRES: '1y',
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
    await dbTestingUtils.clearFixtures(dataSource, usersFixtures);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  describe('When validate a user', () => {
    describe('When user is active', () => {
      it('should return the user', async () => {
        const authUser = {
          id: 1,
          email: 'smith@mail.com',
          firstname: 'Max',
          lastname: 'Smith',
          isActive: true,
          emailVerified: true,
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
    describe('When user does not exist', () => {
      it('should thrown an exception', async () => {
        const authUser = {
          id: 10,
          email: 'smithB@mail.com',
          firstname: 'James',
          lastname: 'Smith',
          isActive: true,
          emailVerified: true,
        };
        await expect(jwtStrategy.validate(authUser)).rejects.toThrow(
          new ForbiddenException('User not valid'),
        );
      });
    });
    describe('When user is inactive', () => {
      it('should thrown an exception', async () => {
        const authUser = {
          id: 5,
          firstname: 'Jay',
          lastname: 'Robertson',
          email: 'jay@mail.com',
          isActive: false,
          emailVerified: false,
        };
        await expect(jwtStrategy.validate(authUser)).rejects.toThrow(
          new ForbiddenException('User not valid'),
        );
      });
    });
    describe('When email is not verified', () => {
      it('should thrown an exception', async () => {
        const authUser = {
          id: 3,
          firstname: 'Rebecca',
          lastname: 'Sanchez',
          isActive: true,
          emailVerified: false,
          email: 'rebecca@mail.com',
        };
        await expect(jwtStrategy.validate(authUser)).rejects.toThrow(
          new ForbiddenException('User not valid'),
        );
      });
    });
  });
});
