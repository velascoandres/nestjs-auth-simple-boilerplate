import { UserEntity } from '../../users/entities/user.entity';

export interface IAuthNewEmailRequest extends Request {
  user: UserEntity & { newEmail: string };
}
