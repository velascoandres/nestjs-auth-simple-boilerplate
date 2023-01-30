import { Entity, Column, OneToMany } from 'typeorm';
import { GenericEntity } from '../../core/generic-entity';
import { UserRoleEntity } from './user-role.entity';

@Entity({ name: 'roles' })
export class RoleEntity extends GenericEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => UserRoleEntity, (userRole) => userRole.role)
  userRoles: UserRoleEntity[];
}
