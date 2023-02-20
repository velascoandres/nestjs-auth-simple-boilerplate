import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmailVerifiedGuard } from '../guards/email-verified.guard';
import { RolesEnum } from '../../users/enums/roles.enum';
import { RoleGuard } from '../guards/role.guard';

export function Roles(...roles: RolesEnum[]) {
  SetMetadata('roles', roles);
  return applyDecorators(
    UseGuards(AuthGuard('jwt'), EmailVerifiedGuard, RoleGuard),
  );
}
