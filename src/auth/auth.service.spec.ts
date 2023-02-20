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
import { mockEmailService } from '../utils/auth-service.mock';
import { AuthEmailService } from './auth-email.service';
import { RoleEntity } from '../users/entities/role.entity';
import { UserRoleEntity } from '../users/entities/user-role.entity';

describe('AuthService', () => {
  let service: AuthService;
  let dataSource: DataSource;
  let module: TestingModule;
  let authEmailService: AuthEmailService;
  let usersService: UsersService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ...dbTestingUtils.TypeOrmSQLITETestingModule([
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
        mockConfigService({
          JWT_ACCESS_SECRET: '123',
          JWT_REFRESH_SECRET: '1234',
          JWT_EXPIRES: '45min',
          JWT_REFRESH_EXPIRES: '1y',
        }),
        mockEmailService(),
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    dataSource = module.get<DataSource>(DataSource);
    authEmailService = module.get<AuthEmailService>(AuthEmailService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterAll(() => {
    module.close();
  });

  beforeEach(async () => {
    jest.clearAllMocks();

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
      const user = await service.validateUserEmailPassword(
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
      const user = await service.validateUserEmailPassword(
        'smith@mail.com',
        'password123452',
      );

      expect(user).toBe(null);
    });

    it('should return null if user is inactive', async () => {
      const user = await service.validateUserEmailPassword(
        'sanchezr@mail.com',
        'password12345',
      );

      expect(user).toBe(null);
    });

    it('should return null if user does not exist', async () => {
      const user = await service.validateUserEmailPassword(
        'rebecca111@mail.com',
        'password12345232',
      );

      expect(user).toBe(null);
    });
  });

  describe('When validate user by id', () => {
    it('should return the user if credentials are right', async () => {
      const user = await service.validateUserById(1);

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

    it('should return null if user is inactive', async () => {
      const user = await service.validateUserById(5);

      expect(user).toBe(null);
    });

    it('should return null if user does not exist', async () => {
      const user = await service.validateUserById(50);

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
        roles: [],
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

  describe('When refresh tokens (access and refresh)', () => {
    describe('When user not exist', () => {
      it('should throws an error', () => {
        expect(service.refreshTokens(10, 'some-refresh-token')).rejects.toThrow(
          'Access Denied (User info not found)',
        );
      });
    });
    describe('When user does not have a refresh token', () => {
      it('should throws an error', () => {
        expect(service.refreshTokens(2, 'some-refresh-token')).rejects.toThrow(
          'Access Denied (User info not found)',
        );
      });
    });
    describe('When refresh token does not match', () => {
      it('should throw an error', () => {
        expect(service.refreshTokens(4, 'some-invalid-token')).rejects.toThrow(
          'Access Denied',
        );
      });
    });
    describe('When refresh token matches', () => {
      it('should return the refreshed tokens', async () => {
        const { accessToken, refreshToken } = await service.refreshTokens(
          4,
          'some-refresh-token',
        );

        expect(accessToken).toContain('eyJhbGci');
        expect(refreshToken).toContain('eyJhbGci');
      });
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
        roles: [],
      };

      const loginResponse = await service.signIn(authUser);

      expect(service.updateUserRefreshToken).toBeCalledWith(
        1,
        expect.stringContaining('eyJhb'),
      );

      expect(loginResponse).toStrictEqual({
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
    const newUser = {
      email: 'some@mail.com',
      password: '123',
      firstname: 'John',
      lastname: 'Foo',
    };

    it('should return a created user with hashed password', async () => {
      const user = await service.signUp(newUser);

      expect(user).toStrictEqual(
        expect.objectContaining({
          firstname: 'John',
          lastname: 'Foo',
          email: 'some@mail.com',
          emailVerified: false,
          isActive: true,
        }),
      );
    });

    it('should send a verification email', async () => {
      jest.spyOn(authEmailService, 'sendVerificationLink');

      await service.signUp(newUser);

      expect(authEmailService.sendVerificationLink).toHaveBeenLastCalledWith(
        'some@mail.com',
        'John',
      );
    });
  });

  describe('When forgot password', () => {
    describe('When user is active', () => {
      it('should call sendForgotPasswordLink', async () => {
        jest.spyOn(authEmailService, 'sendForgotPasswordLink');

        const email = 'reby@mail.com';

        await service.forgotPassword(email);

        expect(authEmailService.sendForgotPasswordLink).toHaveBeenCalledWith(
          email,
          'Reby Sanchez',
        );
      });
    });

    describe('When user does not exist', () => {
      it('should throw an error', () => {
        const email = 'other.user@mail.com';

        expect(service.forgotPassword(email)).rejects.toThrow('User not found');
      });
    });
    describe('When user is inactive', () => {
      it('should throw an error', () => {
        const email = 'jay@mail.com';

        expect(service.forgotPassword(email)).rejects.toThrow(
          'User is inactive',
        );
      });
    });
  });

  describe('When reset password', () => {
    describe('When current password does not match', () => {
      it('should throws an error', () => {
        const resetPasswordDTO = {
          oldPassword: '124',
          newPassword: '12345',
        };
        expect(service.resetPassword(1, resetPasswordDTO)).rejects.toThrow(
          'Password is not correct',
        );
      });
    });

    describe('When password matches', () => {
      it('should update user password', async () => {
        jest.spyOn(usersService, 'updatePassword');

        const resetPasswordDTO = {
          oldPassword: 'password12345',
          newPassword: 'newPassword12345',
        };

        await service.resetPassword(4, resetPasswordDTO);

        expect(usersService.updatePassword).toBeCalled();

        const authUser = await service.validateUserEmailPassword(
          'reby@mail.com',
          'newPassword12345',
        );

        expect(authUser.id).toBe(4);
        expect(authUser.email).toBe('reby@mail.com');
      });
    });
  });

  describe('When change forgotten password', () => {
    it('should change password', async () => {
      const user = {
        id: 4,
        email: 'reby@mail.com',
      };
      const response = await service.changePassword(user.id, 'newPassword');

      expect(response).toBe(true);

      const authUser = await service.validateUserEmailPassword(
        user.email,
        'newPassword',
      );

      expect(authUser.id).toBe(4);
      expect(authUser.email).toBe('reby@mail.com');
    });
  });

  describe('When handle a email address update', () => {
    describe('When user credentials are ok and new email is available', () => {
      it('should call sendNewEmailVerificationLink', async () => {
        jest.spyOn(authEmailService, 'sendNewEmailVerificationLink');

        const response = await service.handleEmailUpdate(4, {
          newEmail: 'new-reby@mail.com',
          password: 'password12345',
        });

        expect(response).toBe(true);

        expect(
          authEmailService.sendNewEmailVerificationLink,
        ).toHaveBeenCalledWith(
          {
            email: 'reby@mail.com',
            newEmail: 'new-reby@mail.com',
          },
          'Reby Sanchez',
        );
      });
    });

    describe('When user credentials are wrong', () => {
      it('should throw an error', async () => {
        await expect(
          service.handleEmailUpdate(4, {
            newEmail: 'new-reby@mail.com',
            password: 'invalid-password',
          }),
        ).rejects.toThrow('Password is not correct');
      });
    });

    describe('When user credentials are ok and email was taken by another user', () => {
      it('should throw an error', async () => {
        try {
          await service.handleEmailUpdate(4, {
            newEmail: 'smith@mail.com',
            password: 'password12345',
          });
        } catch (error) {
          expect(error.message).toBe('Email has been taken by another user');
        }
      });
    });
  });
});
