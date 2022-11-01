import { Request } from 'express';
import { UserEntity } from '../../users/entities/user.entity';

export interface IAuthRequest extends Request {
  user: UserEntity;
}
