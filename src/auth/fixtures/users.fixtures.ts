import { RoleEntity } from '../../users/entities/role.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { UserRoleEntity } from '../../users/entities/user-role.entity';

export default {
  user: {
    entity: UserEntity,
    data: [
      {
        id: 1,
        firstname: 'Max',
        lastname: 'Smith',
        email: 'smith@mail.com',
        isActive: true,
        emailVerified: true,
        password:
          '$argon2id$v=19$m=65536,t=3,p=4$EmfdUmsrZiA8yDC2/JsSKg$mWNzi09EinCxu1eDnqv/jA8iY6JTM3DWQQ8K9INqUWc',
      },
      {
        id: 2,
        firstname: 'Rodolfo',
        lastname: 'Sanchez',
        isActive: false,
        emailVerified: true,
        email: 'sanchezr@mail.com',
        password:
          '$argon2id$v=19$m=65536,t=3,p=4$EmfdUmsrZiA8yDC2/JsSKg$mWNzi09EinCxu1eDnqv/jA8iY6JTM3DWQQ8K9INqUWc',
      },
      {
        id: 3,
        firstname: 'Rebecca',
        lastname: 'Sanchez',
        isActive: true,
        emailVerified: false,
        email: 'rebecca@mail.com',
        password:
          '$argon2id$v=19$m=65536,t=3,p=4$EmfdUmsrZiA8yDC2/JsSKg$mWNzi09EinCxu1eDnqv/jA8iY6JTM3DWQQ8K9INqUWc',
      },
      {
        id: 4,
        firstname: 'Reby',
        lastname: 'Sanchez',
        isActive: true,
        emailVerified: true,
        email: 'reby@mail.com',
        password:
          '$argon2id$v=19$m=65536,t=3,p=4$EmfdUmsrZiA8yDC2/JsSKg$mWNzi09EinCxu1eDnqv/jA8iY6JTM3DWQQ8K9INqUWc',
        refreshToken:
          '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$46PnkN1zK/7g2seVNLVfX/6RaUMijnyKiE2fqzUWGkk',
      },
      {
        id: 5,
        firstname: 'Jay',
        lastname: 'Robertson',
        email: 'jay@mail.com',
        password: 'sha12312',
        isActive: false,
      },
    ],
  },
  role: {
    entity: RoleEntity,
    data: [
      {
        id: 1,
        name: 'ADMIN',
      },
      {
        id: 2,
        name: 'STUDENT',
      },
      {
        id: 3,
        name: 'TEACHER',
      },
    ],
  },
  userRole: {
    entity: UserRoleEntity,
    data: [
      {
        id: 1,
        user: 1,
        role: 1,
      },
      {
        id: 2,
        user: 2,
        role: 1,
      },
      {
        id: 3,
        user: 2,
        role: 3,
      },
      {
        id: 4,
        user: 1,
        role: 2,
      },
    ],
  },
};
