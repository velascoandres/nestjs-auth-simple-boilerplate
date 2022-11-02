export interface IAuthUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  isActive: boolean;
  emailVerified: boolean;
}

export interface IAuthUserRefreshToken extends IAuthUser {
  refreshToken: string;
}
