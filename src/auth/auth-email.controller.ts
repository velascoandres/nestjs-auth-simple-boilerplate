import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Render,
  Req,
} from '@nestjs/common';

import { AccountVerified } from './decorators/account-verified';
import { EmailDTO } from './dtos/email.dto';
import { IAuthNewEmailRequest } from './types/auth-new-email-request';
import { AuthEmailService } from './auth-email.service';

@Controller('auth/email')
export class AuthEmailController {
  constructor(private readonly authEmailService: AuthEmailService) {}

  @Get('/confirm-email')
  @Render('confirm-email')
  renderConfirmEmail(@Query('token') token: string) {
    return { token };
  }
  @Get('verify')
  verifyEmail(@Query('token') token: string) {
    return this.authEmailService.verifyEmailToken(token);
  }

  @Post('resend-confirmation-link')
  resendConfirmationLink(@Body() { email }: EmailDTO) {
    return this.authEmailService.resendConfirmationLink(email);
  }

  @AccountVerified('jwt-change-email')
  @Get('verify-new-email')
  changeEmail(@Req() { user }: IAuthNewEmailRequest) {
    return this.authEmailService.changeEmail(user.id, user.newEmail);
  }
}
