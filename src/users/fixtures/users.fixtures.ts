import { UserEntity } from '../entities/user.entity';
import { RoleEntity } from '../entities/role.entity';
import { UserRoleEntity } from '../entities/user-role.entity';
export default {
  user: {
    entity: UserEntity,
    data: [
      {
        id: 1,
        firstname: 'Jorge',
        lastname: 'Ramirez',
        email: 'jorge@mail.com',
        password: 'sha1231',
      },
      {
        id: 2,
        firstname: 'James',
        lastname: 'Robertson',
        email: 'james@mail.com',
        password: 'sha12312',
      },
      {
        id: 3,
        firstname: 'Carl',
        lastname: 'Robertson',
        email: 'carl@mail.com',
        password: 'sha12312',
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
        userId: 1,
        roleId: 1,
      },
      {
        id: 2,
        userId: 2,
        roleId: 1,
      },
      {
        id: 3,
        userId: 2,
        roleId: 3,
      },
      {
        id: 4,
        userId: 1,
        roleId: 2,
      },
    ],
  },
};
