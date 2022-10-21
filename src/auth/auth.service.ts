import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as argon2 from 'argon2';
import { AuthUserDTO } from './dtos/auth-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthUserDTO | null> {
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

    const authUser = new AuthUserDTO();

    authUser.email = user.email;
    authUser.id = user.id;
    authUser.firstname = user.firstname;
    authUser.lastname = user.lastname;
    authUser.isActive = user.isActive;
    authUser.emailVerified = user.emailVerified;

    return authUser;
  }
}
