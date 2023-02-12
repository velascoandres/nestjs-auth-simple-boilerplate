import { ChangeEmailPasswordDTO } from './dtos/change-email.dto';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Render,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDTO } from '../users/dtos/create-user.dto';
import { AuthService } from './auth.service';
import { IAuthRefreshRequest, IAuthRequest } from './types/auth-request';
import { AuthTokensDTO } from './dtos/auth-tokens.dto';
import { LoginResponseDTO } from './dtos/login-response.dto';
import { IAuthUser } from './types/auth-user';
import { EmailDTO } from './dtos/email.dto';
import { ResetPasswordDTO } from './dtos/reset-password.dto';
import { PasswordDTO } from './dtos/password.dto';
import { AccountVerified } from './decorators/account-verified';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/restore-password')
  @Render('restore-password')
  renderRestorePassword(@Query('token') token: string) {
    return { token };
  }
  @Post('sign-up')
  signUp(@Body() createUserDto: CreateUserDTO): Promise<IAuthUser> {
    return this.authService.signUp(createUserDto);
  }

  @AccountVerified('local')
  @Post('sign-in')
  signIn(@Req() authRequest: IAuthRequest): Promise<LoginResponseDTO> {
    return this.authService.signIn(authRequest.user);
  }

  @AccountVerified('jwt-refresh')
  @Post('refresh-token')
  refreshToken(@Req() { user }: IAuthRefreshRequest): Promise<AuthTokensDTO> {
    return this.authService.refreshTokens(user.id, user.refreshToken);
  }

  @Post('forgot-password')
  sendForgotPasswordLink(@Body() { email }: EmailDTO) {
    return this.authService.forgotPassword(email);
  }

  @AccountVerified('jwt')
  @Post('reset-password')
  resetPassword(
    @Req() { user }: IAuthRequest,
    @Body() resetPasswordDTO: ResetPasswordDTO,
  ) {
    return this.authService.resetPassword(user.id, resetPasswordDTO);
  }

  @AccountVerified('jwt-forgot-password')
  @Post('change-forgotten-password')
  changeForgottenPassword(
    @Req() { user }: IAuthRequest,
    @Body() { password }: PasswordDTO,
  ) {
    return this.authService.changePassword(user.id, password);
  }
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  logOut(@Req() { user }: IAuthRequest) {
    return this.authService.logOut(user.id);
  }

  @AccountVerified('jwt')
  @Post('change-email')
  confirmNewEmail(
    @Req() { user }: IAuthRequest,
    @Body() changeEmailPasswordDTO: ChangeEmailPasswordDTO,
  ) {
    return this.authService.handleEmailUpdate(user.id, changeEmailPasswordDTO);
  }
}
