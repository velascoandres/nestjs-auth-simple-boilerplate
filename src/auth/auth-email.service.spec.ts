import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { mockConfigService } from '../utils/config-service.mock';
import { AuthEmailService } from './auth-email.service';
import envFixtures from './fixtures/env.fixtures';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerService } from '@nestjs-modules/mailer';

import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

describe('AuthEmailService', () => {
  let service: AuthEmailService;
  let emailService: MailerService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
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
      providers: [AuthEmailService, mockConfigService(envFixtures)],
    }).compile();

    service = module.get<AuthEmailService>(AuthEmailService);
    emailService = module.get<MailerService>(MailerService);
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
});
