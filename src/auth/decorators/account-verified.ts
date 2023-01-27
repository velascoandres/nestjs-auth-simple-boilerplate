import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmailVerifiedGuard } from '../guards/email-verified.guard';

export type IStrategyType =
  | 'local'
  | 'jwt'
  | 'jwt-refresh'
  | 'jwt-forgot-password'
  | 'jwt-change-email';

export function AccountVerified(strategyType: IStrategyType) {
  return applyDecorators(
    UseGuards(AuthGuard(strategyType), EmailVerifiedGuard),
  );
}
