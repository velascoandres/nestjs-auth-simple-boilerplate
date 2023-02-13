import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import dbTestingUtils from '../utils/db-testing.utils';
import { UserEntity } from './entities/user.entity';
import userFixtures from './fixtures/users.fixtures';
import { DataSource } from 'typeorm';
import { CreateUserDTO } from './dtos/create-user.dto';
import { RoleEntity } from './entities/role.entity';
import { UserRoleEntity } from './entities/user-role.entity';
import { RolesEnum } from './enums/roles.enum';

describe('UsersService', () => {
  let service: UsersService;
  let dataSource: DataSource;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ...dbTestingUtils.TypeOrmSQLITETestingModule([
          UserEntity,
          RoleEntity,
          UserRoleEntity,
        ]),
      ],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(() => {
    module.close();
  });

  beforeEach(async () => {
    await dbTestingUtils.loadFixtures(dataSource, userFixtures);
  });

  afterEach(async () => {
    await dbTestingUtils.clearFixtures(dataSource, userFixtures);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('When create user', () => {
    it('should create a user', async () => {
      const user = {
        firstname: 'fistname1',
        lastname: 'lastname1',
        email: 'MAIL1@TEST.COM',
        password: 'password12345',
      } as CreateUserDTO;

      const createdUser = await service.createUser(user);
      expect(createdUser).toStrictEqual(
        expect.objectContaining({
          firstname: 'fistname1',
          lastname: 'lastname1',
          email: 'mail1@test.com',
          password: 'password12345',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );
    });
  });

  describe('When create a user with duplicate email', () => {
    it('should thrown an error', async () => {
      const user = {
        firstname: 'fistname1',
        lastname: 'lastname1',
        email: 'jorge@mail.com',
        password: 'password12345',
      } as CreateUserDTO;

      const messagePattern = new RegExp(/email/s);
      await expect(service.createUser(user)).rejects.toThrowError(
        messagePattern,
      );
    });
  });

  describe('When count users', () => {
    it('should count users', async () => {
      const count = await service.countUsers();

      expect(count).toBe(userFixtures.user.data.length);
    });
  });

  describe('When find a user by email', () => {
    it('should return a user', async () => {
      const user = await service.findUserByEmail('jorge@mail.com');

      expect(user).toStrictEqual(
        expect.objectContaining({
          id: 1,
          firstname: 'Jorge',
          lastname: 'Ramirez',
          email: 'jorge@mail.com',
          password: 'sha1231',
        }),
      );
    });

    it('should return a null', async () => {
      const user = await service.findUserByEmail('james.web@mail.com');

      expect(user).toBeNull();
    });
  });

  describe('When update a user', () => {
    it('should thrown an error', async () => {
      const user = {
        firstname: 'James Mcloud',
      };

      const updatedUser = await service.updateUser(2, user);
      expect(updatedUser).toStrictEqual(
        expect.objectContaining({
          id: 2,
          firstname: 'James Mcloud',
          lastname: 'Robertson',
          email: 'james@mail.com',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );
    });
  });

  describe('When mark email as verified', () => {
    it('should update user email as verified', async () => {
      await service.markEmailAsVerified('carl@mail.com');

      const user = await service.findUserByEmail('carl@mail.com');

      expect(user).toStrictEqual(
        expect.objectContaining({
          isActive: true,
          emailVerified: true,
        }),
      );
    });
  });

  describe('When find user by id', () => {
    it('should return user', async () => {
      const user = await service.findUserById(2);

      expect(user).toStrictEqual(
        expect.objectContaining({
          id: 2,
          email: 'james@mail.com',
        }),
      );
    });
  });

  describe('When update user password', () => {
    it('should updated password be different than old password', async () => {
      const userBeforeUpdate = await service.findUserById(2);

      await service.updatePassword(2, 'newPassword');

      const updatedUser = await service.findUserById(2);

      expect(userBeforeUpdate.password).not.toBe(updatedUser.password);
    });
  });

  describe('When get user roles', () => {
    it('should get all user roles', async () => {
      const roles = await service.getUserRoles(1);

      expect(roles).toEqual([
        {
          id: 1,
          name: RolesEnum.ADMIN,
        },
        {
          id: 2,
          name: RolesEnum.BASE_USER,
        },
      ]);
    });
  });
});
