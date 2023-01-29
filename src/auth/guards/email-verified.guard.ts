import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { IAuthRequest } from '../types/auth-request';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request: IAuthRequest = context.switchToHttp().getRequest();

    if (!request.user) {
      throw new UnauthorizedException('User is not valid');
    }

    if (!request.user.emailVerified) {
      throw new UnauthorizedException('Email is not verified yet');
    }

    return true;
  }
}
