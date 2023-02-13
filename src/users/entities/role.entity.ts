import { Entity, Column, OneToMany } from 'typeorm';
import { GenericEntity } from '../../core/generic-entity';
import { UserRoleEntity } from './user-role.entity';
import { RolesEnum } from '../enums/roles.enum';

@Entity({ name: 'roles' })
export class RoleEntity extends GenericEntity {
  @Column({ unique: true })
  name: RolesEnum;

  @OneToMany(() => UserRoleEntity, (userRole) => userRole.role)
  userRoles: UserRoleEntity[];
}
