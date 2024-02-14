import * as argon2 from 'argon2';
import { CreateUserDTO } from 'src/users/dtos/create-user.dto';

import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

import { AuthTokensDTO } from './dtos/auth-tokens.dto';
import { ChangeEmailPasswordDTO } from './dtos/change-email.dto';
import { LoginResponseDTO } from './dtos/login-response.dto';
import { ResetPasswordDTO } from './dtos/reset-password.dto';
import { IAuthUser } from './types/auth-user';
import { AuthEmailService } from './auth-email.service';

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

    if (!user) {
      return null;
    }

    if (!user.isActive) {
      return null;
    }

    const matchPasswords = await argon2.verify(user.password, password);

    if (!matchPasswords) {
      return null;
    }

    return this.getAuthUser(user);
  }

  async validateUserById(userId: number): Promise<IAuthUser | null> {
    const user = await this.userService.findUserById(userId);

    if (!user) {
      return null;
    }

    if (!user.isActive) {
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

    const authUser = await this.getAuthUser(user);

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
      throw new NotFoundException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
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

    return this.changePassword(userId, resetPasswordDTO.newPassword);
  }

  async changePassword(userId: number, newPassword: string) {
    const hashedPassword = await argon2.hash(newPassword);

    await this.userService.updatePassword(userId, hashedPassword);

    return true;
  }

  private async getAuthUser(user: UserEntity): Promise<IAuthUser> {
    const rolesResponse = await this.userService.getUserRoles(user.id);

    const roles = rolesResponse.map((role) => role.name);

    return {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      roles,
    };
  }

  async handleEmailUpdate(
    userId: number,
    { password, newEmail }: ChangeEmailPasswordDTO,
  ): Promise<boolean> {
    const user = await this.userService.findUserById(userId);

    const matchPasswords = await argon2.verify(user.password, password);

    if (!matchPasswords) {
      throw new BadRequestException('Password is not correct');
    }

    const emailAlreadyUsed = await this.userService.findUserByEmail(newEmail);

    if (emailAlreadyUsed) {
      throw new BadRequestException('Email has been taken by another user');
    }

    const { firstname, lastname } = user;

    const username = `${firstname} ${lastname}`;

    await this.authEmailService.sendNewEmailVerificationLink(
      {
        email: user.email,
        newEmail,
      },
      username,
    );

    return true;
  }
}
