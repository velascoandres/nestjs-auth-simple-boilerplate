import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDTO } from './dtos/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRespository: Repository<UserEntity>,
  ) {}

  createUser(createUserDto: CreateUserDTO): Promise<UserEntity> {
    return this.userRespository.save(createUserDto);
  }

  countUsers(): Promise<number> {
    return this.userRespository.count();
  }
}
