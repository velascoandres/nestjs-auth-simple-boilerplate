import { IAuthUser } from '../types/auth-user';

export class LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  user: IAuthUser;
}
