import { UserEntity } from '../entities/user.entity';
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
};
