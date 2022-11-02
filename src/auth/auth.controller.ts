import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDTO } from '../users/dtos/create-user.dto';
import { AuthService } from './auth.service';
import { IAuthRequest } from './types/auth-request';
import { AuthTokensDTO } from './dtos/auth-tokens.dto';
import { LoginResponseDTO } from './dtos/login-response.dto';
import { IAuthUser } from './types/auth-user';
import { EmailDTO } from './dtos/email.dto';
import { ResetPasswordDTO } from './dtos/reset-password.dto';
import { PasswordDTO } from './dtos/password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('sign-up')
  signUp(@Body() createUserDto: CreateUserDTO): Promise<IAuthUser> {
    return this.authService.signUp(createUserDto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('sign-in')
  signIn(@Req() authRequest: IAuthRequest): Promise<LoginResponseDTO> {
    return this.authService.signIn(authRequest.user);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh-token')
  refreshToken(@Req() { user }: IAuthRequest): Promise<AuthTokensDTO> {
    return this.authService.refreshTokens(user.id, user.refreshToken);
  }

  @Post('forgot-password')
  sendForgotPasswordLink(@Body() { email }: EmailDTO) {
    return this.authService.forgotPassword(email);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('reset-password')
  resetPassword(
    @Req() { user }: IAuthRequest,
    @Body() resetPasswordDTO: ResetPasswordDTO,
  ) {
    return this.authService.resetPassword(user.id, resetPasswordDTO);
  }

  @UseGuards(AuthGuard('jwt-forgot-password'))
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
}
