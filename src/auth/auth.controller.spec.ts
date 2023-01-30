import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import dbTestingUtils from '../utils/db-testing.utils';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { mockEmailService } from '../utils/auth-service.mock';
import { RoleEntity } from '../users/entities/role.entity';
import { UserRoleEntity } from '../users/entities/user-role.entity';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      imports: [
        ...dbTestingUtils.TypeOrmSQLITETestingModule([
          UserEntity,
          RoleEntity,
          UserRoleEntity,
        ]),
        ConfigModule,
        JwtModule.register({}),
        PassportModule,
      ],
      providers: [AuthService, UsersService, mockEmailService()],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
