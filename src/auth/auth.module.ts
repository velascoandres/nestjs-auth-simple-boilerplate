import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthEmailService } from './auth-email.service';
import commonImports from './config/common-imports';

@Module({
  imports: [...commonImports],
  providers: [AuthService, LocalStrategy, AuthEmailService],
  controllers: [AuthController],
})
export class AuthModule {}
