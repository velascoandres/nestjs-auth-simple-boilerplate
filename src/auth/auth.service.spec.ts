import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import dbTestingUtils from '../utils/db-testing.utils';
import { AuthService } from './auth.service';
import usersFixtures from './fixtures/users.fixtures';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { mockConfigService } from '../utils/config-service.mock';

describe('AuthService', () => {
  let service: AuthService;
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
        mockConfigService({
          JWT_ACCESS_SECRET: '123',
          JWT_REFRESH_SECRET: '1234',
          JWT_EXPIRES: '45min',
          JWT_REFRESH_EXPIRES: '1y',
        }),
      ],
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

  describe('When generate tokens', () => {
    it('should generate an accessToken', async () => {
      const authUser = {
        id: 1,
        email: 'smith@mail.com',
        firstname: 'Max',
        lastname: 'Smith',
        isActive: true,
        emailVerified: true,
      };

      const tokens = await service.getTokens(authUser);

      expect(tokens).toStrictEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });
  });

  describe('When update refreshToken', () => {
    it('should update refreshToken', async () => {
      const userRefreshed = await service.updateUserRefreshToken(
        1,
        'newRefreshToken',
      );

      expect(userRefreshed).toStrictEqual(
        expect.objectContaining({
          refreshToken: expect.stringContaining(
            '$argon2id$v=19$m=65536,t=3,p=4',
          ),
        }),
      );
    });
  });

  describe('When signIn a user', () => {
    it('should sign in with an accessToken and refreshToken', async () => {
      jest.spyOn(service, 'updateUserRefreshToken');

      const authUser = {
        id: 1,
        email: 'smith@mail.com',
        firstname: 'Max',
        lastname: 'Smith',
        isActive: true,
        emailVerified: true,
      };

      const logginResponse = await service.signIn(authUser);

      expect(service.updateUserRefreshToken).toBeCalledWith(
        1,
        expect.stringContaining('eyJhb'),
      );

      expect(logginResponse).toStrictEqual({
        accessToken: expect.stringContaining('eyJhb'),
        refreshToken: expect.stringContaining('eyJhb'),
        user: authUser,
      });
    });
  });

  describe('When logOut a user', () => {
    it('should  return a updated user with refreshToken null', async () => {
      const user = await service.logOut(4);

      expect(user).toStrictEqual(
        expect.objectContaining({
          id: 4,
          refreshToken: null,
        }),
      );
    });
  });

  describe('When signUp a user', () => {
    it('should  return a created user with hashed password', async () => {
      const newUser = {
        email: 'some@mail.com',
        password: '123',
        firstname: 'John',
        lastname: 'Foo',
      };

      const user = await service.signUp(newUser);

      expect(user).toStrictEqual(
        expect.objectContaining({
          id: 5,
          firstname: 'John',
          lastname: 'Foo',
          email: 'some@mail.com',
          password: expect.stringContaining('$argon2id$v=19$m=65536,t=3,p=4'),
          refreshToken: null,
        }),
      );
    });
  });
});
