import { Entity, Index, ManyToOne } from 'typeorm';
import { GenericEntity } from '../../core/generic-entity';
import { UserEntity } from './user.entity';
import { RoleEntity } from './role.entity';

@Index(['user', 'role'], { unique: true })
@Entity({ name: 'user-role' })
export class UserRoleEntity extends GenericEntity {
  @ManyToOne(() => UserEntity, (user) => user.userRoles)
  user: UserEntity;

  @ManyToOne(() => RoleEntity, (role) => role.userRoles)
  role: RoleEntity;
}
