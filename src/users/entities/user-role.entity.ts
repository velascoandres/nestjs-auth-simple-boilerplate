import { Entity, Index, ManyToOne } from 'typeorm';
import { JoinColumn } from 'typeorm';

import { GenericEntity } from '../../core/generic-entity';

import { RoleEntity } from './role.entity';
import { UserEntity } from './user.entity';

@Index(['user', 'role'], { unique: true })
@Entity({ name: 'user_role' })
export class UserRoleEntity extends GenericEntity {
  @Index()
  @ManyToOne(() => UserEntity, (user) => user.userRoles, {
    nullable: false,
  })
  @JoinColumn({ name: 'user' })
  user: UserEntity;

  @Index()
  @ManyToOne(() => RoleEntity, (role) => role.userRoles, {
    nullable: false,
  })
  @JoinColumn({ name: 'role' })
  role: RoleEntity;
}
