import { Module } from '@nestjs/common';

import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtForgotPasswordStrategy } from './strategies/jwt-forgot-password.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { EmailAvailableConstraint } from './validations/email-available';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthEmailController } from './auth-email.controller';
import { AuthEmailService } from './auth-email.service';
import commonImports from './common-imports';

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
