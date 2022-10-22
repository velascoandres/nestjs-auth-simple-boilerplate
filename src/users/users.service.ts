import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDTO } from './dtos/create-user.dto';
import * as argon2 from 'argon2';
import { UpdateUserDTO } from './dtos/update-user.dto';

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
      email: createUserDto.email.toLowerCase(),
      password: hashedPassword,
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
}
