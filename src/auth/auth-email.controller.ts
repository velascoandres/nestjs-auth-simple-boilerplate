import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthEmailService } from './auth-email.service';
import { EmailDTO } from './dtos/email.dto';

@Controller('auth/email')
export class AuthEmailController {
  constructor(private readonly authEmailService: AuthEmailService) {}

  @Get('verify')
  verifyEmail(@Query('token') token: string) {
    return this.authEmailService.verifyEmailToken(token);
  }

  @Post('resend-confirmation-link')
  resendConfirmationLink(@Body('token') { email }: EmailDTO) {
    return this.authEmailService.resendConfirmationLink(email);
  }
}
