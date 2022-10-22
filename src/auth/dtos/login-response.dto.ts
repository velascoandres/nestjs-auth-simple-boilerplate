import { AuthUserDTO } from './auth-user.dto';

export class LogginResonseDTO {
  accessToken: string;
  refreshToken: string;
  user: AuthUserDTO;
}
