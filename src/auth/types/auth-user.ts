interface IUserRole {
  id: number;
  name: string;
}

export interface IAuthUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  isActive: boolean;
  emailVerified: boolean;

  roles: IUserRole[];
}

export interface IAuthUserRefreshToken extends IAuthUser {
  refreshToken: string;
}
