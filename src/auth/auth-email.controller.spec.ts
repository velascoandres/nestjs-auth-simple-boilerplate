import { Test, TestingModule } from '@nestjs/testing';
import { AuthEmailController } from './auth-email.controller';
import dbTestingUtils from '../utils/db-testing.utils';
import { UserEntity } from '../users/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AuthEmailService } from './auth-email.service';
import { mockEmailService } from '../utils/auth-service.mock';
import { RoleEntity } from "../users/entities/role.entity";
import { UserRoleEntity } from "../users/entities/user-role.entity";

describe('AuthEmailController', () => {
  let controller: AuthEmailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
      providers: [
        AuthService,
        UsersService,
        AuthEmailService,
        mockEmailService(),
      ],
      controllers: [AuthEmailController],
    }).compile();

    controller = module.get<AuthEmailController>(AuthEmailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
