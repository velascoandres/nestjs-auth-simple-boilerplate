import { Column, Entity, OneToMany } from 'typeorm';

import { GenericEntity } from '../../core/generic-entity';
import { RolesEnum } from '../enums/roles.enum';

import { UserRoleEntity } from './user-role.entity';

@Entity({ name: 'roles' })
export class RoleEntity extends GenericEntity {
  @Column({ unique: true })
  name: RolesEnum;

  @OneToMany(() => UserRoleEntity, (userRole) => userRole.role)
  userRoles: UserRoleEntity[];
}
