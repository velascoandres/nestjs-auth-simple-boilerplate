import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { UsersService } from '../users/users.service';
import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { IAuthUser } from './types/auth-user';

@Injectable()
export class AuthEmailService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: MailerService,
    private readonly usersService: UsersService,
  ) {}

  sendVerificationLink(email: string, username?: string) {
    const token = this.jwtService.sign(
      { email },
      {
        secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
        expiresIn: this.configService.get(
          'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME',
        ),
      },
    );

    const link = `${this.configService.get(
      'EMAIL_CONFIRMATION_URL',
    )}?token=${token}`;

    return this.emailService.sendMail({
      to: email,
      subject: 'Welcome to the application. To confirm the email address',
      template: './confirmation',
      context: {
        username: username || email,
        link,
      },
    });
  }

  validateConfirmEmailToken(token: string): string {
    const { email } = this.jwtService.verify(token, {
      secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
    });

    if (email) {
      return email;
    }

    throw new BadRequestException('Invalid token payload');
  }

  async verifyEmailToken(token: string): Promise<IAuthUser> {
    const email = this.validateConfirmEmailToken(token);

    const user = await this.usersService.findUserByEmail(email);

    if (!user.isActive) {
      throw new UnauthorizedException('User is not active');
    }

    await this.usersService.markEmailAsVerified(email);

    return {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      isActive: user.isActive,
      emailVerified: true,
    };
  }

  async resendConfirmationLink(email: string): Promise<void> {
    const user = await this.usersService.findUserByEmail(email);
    if (user.emailVerified) {
      throw new BadRequestException('Email has been verified');
    }
    await this.sendVerificationLink(user.email);
  }

  async sendForgotPasswordLink(email: string, username: string): Promise<void> {
    const token = this.jwtService.sign(
      { email },
      {
        secret: this.configService.get('JWT_FORGOT_PASSWORD_TOKEN_SECRET'),
        expiresIn: this.configService.get(
          'JWT_FORGOT_PASSWORD_TOKEN_EXPIRATION_TIME',
        ),
      },
    );

    const link = `${this.configService.get(
      'FORGOT_PASSWORD_URL',
    )}?token=${token}`;

    return this.emailService.sendMail({
      to: email,
      subject: 'Reset your password',
      template: './restore-password',
      context: {
        username: username,
        link,
      },
    });
  }
}
