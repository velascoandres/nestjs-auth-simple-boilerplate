import { ForbiddenException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as argon2 from 'argon2';
import { IAuthUser } from './types/auth-user';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthTokensDTO } from './dtos/auth-tokens.dto';
import { LoginResponseDTO } from './dtos/login-response.dto';
import { UserEntity } from '../users/entities/user.entity';
import { CreateUserDTO } from 'src/users/dtos/create-user.dto';
import { AuthEmailService } from './auth-email.service';
import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { NotFoundError } from 'rxjs';
import { ResetPasswordDTO } from './dtos/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authEmailService: AuthEmailService,
  ) {}

  async validateUserEmailPassword(
    email: string,
    password: string,
  ): Promise<IAuthUser | null> {
    const user = await this.userService.findUserByEmail(email);

    if (!user.isActive) {
      return null;
    }

    if (!user.emailVerified) {
      return null;
    }

    const matchPasswords = await argon2.verify(user.password, password);

    if (!matchPasswords) {
      return null;
    }

    return this.getAuthUser(user);
  }

  async signIn(user: IAuthUser): Promise<LoginResponseDTO> {
    const { accessToken, refreshToken } = await this.getTokens(user);

    await this.updateUserRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async updateUserRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<UserEntity> {
    const hashedToken = await argon2.hash(refreshToken);

    return this.userService.updateUser(userId, {
      refreshToken: hashedToken,
    });
  }

  async refreshTokens(
    userId: number,
    refreshToken: string,
  ): Promise<AuthTokensDTO> {
    const user = await this.userService.findUserById(userId);

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied (User info not found)');
    }

    const refreshTokenMatches = await argon2.verify(
      user.refreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access Denied');
    }

    const authUser = this.getAuthUser(user);

    const tokens = await this.getTokens(authUser);

    await this.updateUserRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async getTokens(authUser: IAuthUser): Promise<AuthTokensDTO> {
    const accessTokenResponse = this.jwtService.signAsync(authUser, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES'),
    });

    const refreshTokenResponse = this.jwtService.signAsync(authUser, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES'),
    });

    const [accessToken, refreshToken] = await Promise.all([
      accessTokenResponse,
      refreshTokenResponse,
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  logOut(userId: number): Promise<UserEntity> {
    return this.userService.updateUser(userId, {
      refreshToken: null,
    });
  }

  async signUp(user: CreateUserDTO): Promise<IAuthUser> {
    const hashedPassword = await argon2.hash(user.password);

    const createdUser = await this.userService.createUser({
      ...user,
      password: hashedPassword,
    });

    await this.authEmailService.sendVerificationLink(
      createdUser.email,
      createdUser.firstname,
    );

    return this.getAuthUser(createdUser);
  }

  async forgotPassword(email: string): Promise<boolean> {
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    if (!user.emailVerified) {
      throw new BadRequestException('Email is not verified');
    }

    const { firstname, lastname } = user;

    const username = `${firstname} ${lastname}`;

    await this.authEmailService.sendForgotPasswordLink(email, username);

    return true;
  }

  async resetPassword(userId: number, resetPasswordDTO: ResetPasswordDTO) {
    const user = await this.userService.findUserById(userId);

    const matchPasswords = await argon2.verify(
      user.password,
      resetPasswordDTO.oldPassword,
    );

    if (!matchPasswords) {
      throw new BadRequestException('Password is not correct');
    }

    const hashedPassword = await argon2.hash(user.password);

    await this.userService.updatePassword(userId, hashedPassword);

    return true;
  }

  private getAuthUser(user: UserEntity) {
    return {
      email: user.email,
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
    };
  }
}
