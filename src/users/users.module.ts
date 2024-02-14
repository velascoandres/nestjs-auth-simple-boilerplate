import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from './entities/user.entity';
import { UserRoleEntity } from './entities/user-role.entity';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserRoleEntity, UserRoleEntity]),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
