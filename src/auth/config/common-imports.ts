import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { join } from 'path';
import { UsersModule } from '../../users/users.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export default [
  UsersModule,
  JwtModule.register({}),
  PassportModule,
  ConfigModule,
  MailerModule.forRootAsync({
    useFactory: async (config: ConfigService) => ({
      transport: {
        host: config.get('MAIL_HOST'),
        port: 587,
        secure: false,
        auth: {
          user: config.get('MAIL_USER'),
          pass: config.get('MAIL_PASSWORD'),
        },
      },
      defaults: {
        from: `"No Reply" <${config.get('MAIL_FROM')}>`,
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    inject: [ConfigService],
  }),
];
