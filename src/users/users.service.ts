import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UpdateUserDTO } from './dtos/update-user.dto';
import { UserRoleEntity } from './entities/user-role.entity';
import { RoleEntity } from './entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepository: Repository<UserRoleEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDTO): Promise<UserEntity> {
    return this.userRepository.save({
      ...createUserDto,
      email: createUserDto.email.toLowerCase(),
    });
  }

  countUsers(): Promise<number> {
    return this.userRepository.count();
  }

  findUserByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({ email: email.toLowerCase() });
  }

  findUserById(userId: number): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({ id: userId });
  }

  async updateUser(
    id: number,
    updateUserDTO: UpdateUserDTO,
  ): Promise<UserEntity> {
    await this.userRepository.update(id, updateUserDTO);

    return this.userRepository.findOneBy({ id });
  }

  async updatePassword(id: number, newPassword: string): Promise<void> {
    await this.userRepository.update(id, { password: newPassword });
  }

  async markEmailAsVerified(email): Promise<void> {
    await this.userRepository.update(
      { email },
      {
        emailVerified: true,
      },
    );
  }

  async getUserRoles(userId: number): Promise<RoleEntity[]> {
    const query = this.userRoleRepository
      .createQueryBuilder('userRole')
      .innerJoin('userRole.role', 'role')
      .where('userRole.user=:userId', { userId })
      .select(['userRole.id', 'role.id', 'role.name']);

    const userRoles = await query.getMany();

    return userRoles.map((userRoles) => userRoles.role);
  }
}
