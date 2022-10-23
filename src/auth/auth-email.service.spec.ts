import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';
import { mockConfigService } from '../utils/config-service.mock';
import { AuthEmailService } from './auth-email.service';
import envFixtures from './fixtures/env.fixtures';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

describe('AuthEmailService', () => {
  let service: AuthEmailService;

  beforeEach(async () => {
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
