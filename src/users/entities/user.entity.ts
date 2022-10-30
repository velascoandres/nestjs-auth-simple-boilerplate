import { Entity, Column, Index } from 'typeorm';
import { GenericEntity } from '../../core/generic-entity';

@Entity()
export class UserEntity extends GenericEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  password: string;

  @Index()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Index()
  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  refreshToken?: string;
}
