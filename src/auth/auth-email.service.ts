import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { UsersService } from '../users/users.service';
import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { AuthUserDTO } from './dtos/auth-user.dto';

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

  async verifyEmailToken(token: string): Promise<AuthUserDTO> {
    const email = this.validateConfirmEmailToken(token);

    const user = await this.usersService.findUserByEmail(email);

    if (!user.isActive) {
      throw new UnauthorizedException('User is not active');
    }

    await this.usersService.markEmailAsVerified(email);

    const authUser = new AuthUserDTO();

    authUser.email = user.email;
    authUser.id = user.id;
    authUser.firstname = user.firstname;
    authUser.lastname = user.lastname;
    authUser.isActive = user.isActive;
    authUser.emailVerified = true;

    return authUser;
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
