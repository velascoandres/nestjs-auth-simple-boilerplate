import { UserEntity } from '../../users/entities/user.entity';

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
    ],
  },
};
