import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { mockConfigService } from '../utils/config-service.mock';
import { AuthEmailService } from './auth-email.service';
import envFixtures from './fixtures/env.fixtures';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerService } from '@nestjs-modules/mailer';

import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import dbTestingUtils from '../utils/db-testing.utils';
import usersFixtures from './fixtures/users.fixtures';
import { DataSource } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

describe('AuthEmailService', () => {
  let service: AuthEmailService;
  let emailService: MailerService;
  let module: TestingModule;
  let dataSource: DataSource;
  let jwtService: JwtService;

  beforeAll(async () => {
    jest.clearAllMocks();

    module = await Test.createTestingModule({
      imports: [
        ...dbTestingUtils.TypeOrmSQLITETestingModule([UserEntity]),
        JwtModule.register({}),
        PassportModule,
        ConfigModule,
        MailerModule.forRoot({
          transport: {
            host: envFixtures.MAIL_HOST,
            port: 587,
            secure: false,
            auth: {
              user: envFixtures.MAIL_USER,
              pass: envFixtures.MAIL_PASSWORD,
            },
          },
          defaults: {
            from: `"No Reply" <${envFixtures.MAIL_HOST}>`,
          },
          template: {
            dir: 'templates-fake-path',
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        }),
      ],
      providers: [
        AuthEmailService,
        mockConfigService(envFixtures),
        UsersService,
      ],
    }).compile();

    service = module.get<AuthEmailService>(AuthEmailService);
    emailService = module.get<MailerService>(MailerService);
    dataSource = module.get<DataSource>(DataSource);
    jwtService = module.get<JwtService>(JwtService);
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

  describe('When send a confirmationLink', () => {
    it('should send an email confirmation link', async () => {
      jest.spyOn(emailService, 'sendMail').mockImplementation(jest.fn());

      await service.sendVerificationLink('some@mail.com', 'username1');

      expect(emailService.sendMail).toHaveBeenCalledWith({
        to: 'some@mail.com',
        subject: 'Welcome to the application. To confirm the email address',
        template: './confirmation',
        context: {
          username: 'username1',
          link: expect.stringContaining('/auth/confirm-email?token=eyJhb'),
        },
      });
    });

    it('should send an email confirmation link without username', async () => {
      jest.spyOn(emailService, 'sendMail').mockImplementation(jest.fn());

      await service.sendVerificationLink('some@mail.com');

      expect(emailService.sendMail).toHaveBeenCalledWith({
        to: 'some@mail.com',
        subject: 'Welcome to the application. To confirm the email address',
        template: './confirmation',
        context: {
          username: 'some@mail.com',
          link: expect.stringContaining('/auth/confirm-email?token=eyJhb'),
        },
      });
    });
  });

  describe('When validate confirm email token', () => {
    describe('When token has a valid payload', () => {
      beforeEach(() => {
        jest
          .spyOn(jwtService, 'verify')
          .mockReturnValue({ email: 'smith@mail.com' });
      });

      it('should return the email', () => {
        const email = service.validateConfirmEmailToken('some-token');

        expect(email).toEqual('smith@mail.com');
      });
    });

    describe('When token has an invalid payloadd', () => {
      beforeEach(() => {
        jest.spyOn(jwtService, 'verify').mockReturnValue({});
      });

      it('should throw an error', () => {
        expect(() => service.validateConfirmEmailToken('some-token')).toThrow(
          'Invalid token payload',
        );
      });
    });
  });

  describe('When verify an email token', () => {
    describe('When user is active', () => {
      beforeEach(() => {
        jest
          .spyOn(jwtService, 'verify')
          .mockReturnValue({ email: 'smith@mail.com' });
      });

      it('should return the updated user', async () => {
        const user = await service.verifyEmailToken('some-token');

        expect(user).toStrictEqual(
          expect.objectContaining({
            id: 1,
            emailVerified: true,
            email: 'smith@mail.com',
          }),
        );
      });
    });

    describe('When user is inactive', () => {
      beforeEach(() => {
        jest
          .spyOn(jwtService, 'verify')
          .mockReturnValue({ email: 'jay@mail.com' });
      });
      it('should throw an error', () => {
        expect(service.verifyEmailToken('jay@mail.com')).rejects.toThrow(
          'User is not active',
        );
      });
    });
  });
});
