import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDTO } from './dtos/create-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRespository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDTO): Promise<UserEntity> {
    const hashedPassword = await argon2.hash(createUserDto.password);
    return this.userRespository.save({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  countUsers(): Promise<number> {
    return this.userRespository.count();
  }
}
