import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { IAuthUser } from '../types/auth-user';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<IAuthUser> {
    const user = await this.authService.validateUserEmailPassword(
      email,
      password,
    );
    if (!user) {
      throw new UnauthorizedException('User not valid');
    }
    return user;
  }
}
