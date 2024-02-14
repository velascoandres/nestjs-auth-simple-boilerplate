import { Test, TestingModule } from '@nestjs/testing';
import { AuthEmailController } from './auth-email.controller';
import dbTestingUtils from '../test-utils/db-testing.utils';
import { UserEntity } from '../users/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AuthEmailService } from './auth-email.service';
import { mockEmailService } from '../test-utils/auth-service.mock';
import { RoleEntity } from '../users/entities/role.entity';
import { UserRoleEntity } from '../users/entities/user-role.entity';
import { createMock } from '@golevelup/ts-jest';
import { IAuthNewEmailRequest } from './types/auth-new-email-request';

describe('AuthEmailController', () => {
  let controller: AuthEmailController;
  let authEmailService: AuthEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
      providers: [
        AuthService,
        UsersService,
        AuthEmailService,
        mockEmailService(),
      ],
      controllers: [AuthEmailController],
    }).compile();

    controller = module.get<AuthEmailController>(AuthEmailController);
    authEmailService = module.get<AuthEmailService>(AuthEmailService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should bind a "token" to view for rendering', () => {
    const value = controller.renderConfirmEmail('some-token');

    expect(value).toStrictEqual({ token: 'some-token' });
  });

  it('should call "verifyEmailToken"', () => {
    jest
      .spyOn(authEmailService, 'verifyEmailToken')
      .mockImplementation(jest.fn());

    controller.verifyEmail('token');

    expect(authEmailService.verifyEmailToken).toHaveBeenCalledWith('token');
  });

  it('should call "resendConfirmationLink"', () => {
    const emailPayload = {
      email: 'some@mail.com',
    };

    jest
      .spyOn(authEmailService, 'resendConfirmationLink')
      .mockImplementation(jest.fn());

    controller.resendConfirmationLink(emailPayload);

    expect(authEmailService.resendConfirmationLink).toHaveBeenCalledWith(
      emailPayload.email,
    );
  });

  it('should call "changeEmail"', () => {
    const mockRequest = createMock<IAuthNewEmailRequest>();

    mockRequest.user = {
      id: 1,
      createdAt: new Date(),
      newEmail: 'new@mail.com',
      updatedAt: new Date(),
      userRoles: [],
      firstname: 'Max',
      lastname: 'Smith',
      email: 'smith@mail.com',
      isActive: true,
      emailVerified: true,
      password: 'hashed-password',
    };
    jest.spyOn(authEmailService, 'changeEmail').mockImplementation(jest.fn());

    controller.changeEmail(mockRequest);

    expect(authEmailService.changeEmail).toHaveBeenCalledWith(
      mockRequest.user.id,
      mockRequest.user.newEmail,
    );
  });
});
