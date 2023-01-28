import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthEmailService } from './auth-email.service';
import commonImports from './common-imports';
import { AuthEmailController } from './auth-email.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtForgotPasswordStrategy } from './strategies/jwt-forgot-password.strategy';
import { EmailAvailableConstraint } from './validations/email-available';

@Module({
  imports: [...commonImports],
  providers: [
    AuthService,
    LocalStrategy,
    AuthEmailService,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtForgotPasswordStrategy,
    EmailAvailableConstraint,
  ],
  controllers: [AuthController, AuthEmailController],
})
export class AuthModule {}
