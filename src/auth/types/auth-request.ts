import { Request } from 'express';
import { IAuthUser } from './auth-user';

export interface IAuthRequest extends Request {
  user: IAuthUser;
}

export interface IAuthRefreshRequest extends Request {
  user: IAuthUser & { refreshToken: string };
}
