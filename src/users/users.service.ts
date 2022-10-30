import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UpdateUserDTO } from './dtos/update-user.dto';
import { BadRequestException } from '@nestjs/common/exceptions';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRespository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDTO): Promise<UserEntity> {
    return this.userRespository.save({
      ...createUserDto,
      email: createUserDto.email.toLowerCase(),
    });
  }

  countUsers(): Promise<number> {
    return this.userRespository.count();
  }

  findUserByEmail(email: string): Promise<UserEntity | null> {
    return this.userRespository.findOneBy({ email: email.toLowerCase() });
  }

  async updateUser(
    id: number,
    updateUserDTO: UpdateUserDTO,
  ): Promise<UserEntity> {
    await this.userRespository.update(id, updateUserDTO);

    return this.userRespository.findOneBy({ id });
  }

  async verifyEmail(email): Promise<UserEntity> {
    const user = await this.findUserByEmail(email);

    if (!user.isActive) {
      throw new UnauthorizedException('User is not active');
    }

    return this.updateUser(user.id, {
      emailVerified: true,
    });
  }
}
