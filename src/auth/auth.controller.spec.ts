import { createMock } from '@golevelup/ts-jest';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { mockEmailService } from '../test-utils/auth-service.mock';
import dbTestingUtils from '../test-utils/db-testing.utils';
import { CreateUserDTO } from '../users/dtos/create-user.dto';
import { RoleEntity } from '../users/entities/role.entity';
import { UserEntity } from '../users/entities/user.entity';
import { UserRoleEntity } from '../users/entities/user-role.entity';
import { UsersService } from '../users/users.service';

import { IAuthRefreshRequest, IAuthRequest } from './types/auth-request';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const MOCK_USER = {
  id: 1,
  firstname: 'Karl',
  lastname: 'Maxwell',
  email: 'k@mail.com',
  roles: ['ADMIN'],
  emailVerified: true,
  isActive: true,
};

const MOCK_REFRESH_USER = {
  ...MOCK_USER,
  refreshToken: 'some-refresh-token',
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      imports: [
        ...dbTestingUtils.TypeOrmTestingModule([
          UserEntity,
          RoleEntity,
          UserRoleEntity,
        ]),
        ConfigModule,
        JwtModule.register({}),
        PassportModule,
      ],
      providers: [AuthService, UsersService, mockEmailService()],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call "signIn" method', () => {
    const mockRequest = createMock<IAuthRequest>();

    mockRequest.user = MOCK_USER;
    jest.spyOn(authService, 'signIn').mockImplementation(jest.fn());

    controller.signIn(mockRequest);

    expect(authService.signIn).toHaveBeenCalledWith(MOCK_USER);
  });

  it('should call "signUp" method', () => {
    const newUserData: CreateUserDTO = {
      email: 'k@mail.com',
      firstname: 'fred',
      lastname: 'smith',
      password: 'password-123',
    };

    jest.spyOn(authService, 'signUp').mockImplementation(jest.fn());

    controller.signUp(newUserData);

    expect(authService.signUp).toHaveBeenCalledWith(newUserData);
  });

  it('should call "refreshTokens" method', () => {
    const mockRequest = createMock<IAuthRefreshRequest>();

    mockRequest.user = MOCK_REFRESH_USER;
    jest.spyOn(authService, 'refreshTokens').mockImplementation(jest.fn());

    controller.refreshToken(mockRequest);

    expect(authService.refreshTokens).toHaveBeenCalledWith(
      MOCK_REFRESH_USER.id,
      MOCK_REFRESH_USER.refreshToken,
    );
  });

  it('should call "resetPassword" method', () => {
    const mockRequest = createMock<IAuthRequest>();
    const resetPasswordPayload = {
      oldPassword: 'old-pwd',
      newPassword: 'new-pwd',
    };

    mockRequest.user = MOCK_USER;
    jest.spyOn(authService, 'resetPassword').mockImplementation(jest.fn());

    controller.resetPassword(mockRequest, resetPasswordPayload);

    expect(authService.resetPassword).toHaveBeenCalledWith(
      MOCK_USER.id,
      resetPasswordPayload,
    );
  });

  it('should call "changePassword" method', () => {
    const mockRequest = createMock<IAuthRequest>();
    const passwordPayload = {
      password: 'password',
    };

    mockRequest.user = MOCK_USER;
    jest.spyOn(authService, 'changePassword').mockImplementation(jest.fn());

    controller.changeForgottenPassword(mockRequest, passwordPayload);

    expect(authService.changePassword).toHaveBeenCalledWith(
      MOCK_USER.id,
      passwordPayload.password,
    );
  });

  it('should call "logout" method', () => {
    const mockRequest = createMock<IAuthRequest>();

    mockRequest.user = MOCK_USER;
    jest.spyOn(authService, 'logOut').mockImplementation(jest.fn());

    controller.logOut(mockRequest);

    expect(authService.logOut).toHaveBeenCalledWith(MOCK_USER.id);
  });

  it('should call "handleEmailUpdate" method', () => {
    const mockRequest = createMock<IAuthRequest>();
    const changeEmailPayload = {
      password: 'password123',
      newEmail: 'new@mail.com',
    };

    mockRequest.user = MOCK_USER;
    jest.spyOn(authService, 'handleEmailUpdate').mockImplementation(jest.fn());

    controller.confirmNewEmail(mockRequest, changeEmailPayload);

    expect(authService.handleEmailUpdate).toHaveBeenCalledWith(
      MOCK_USER.id,
      changeEmailPayload,
    );
  });

  it('should bind a "token" to view for rendering', () => {
    const value = controller.renderRestorePassword('some-token');

    expect(value).toStrictEqual({ token: 'some-token' });
  });
});
