import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions';

import { EmailVerifiedGuard } from './email-verified.guard';

describe('EmailVerifiedGuard', () => {
  let emailVerifiedGuard: EmailVerifiedGuard;

  beforeEach(() => {
    emailVerifiedGuard = new EmailVerifiedGuard();
  });

  it('should be defined', () => {
    expect(emailVerifiedGuard).toBeDefined();
  });

  describe('Can activate', () => {
    describe('When user email is verified', () => {
      it('should return true', () => {
        const mockContext = createMock<ExecutionContext>();
        mockContext.switchToHttp().getRequest.mockReturnValue({
          user: {
            emailVerified: true,
          },
        });

        const canActivate = emailVerifiedGuard.canActivate(mockContext);

        expect(canActivate).toBe(true);
      });
    });

    describe('When user email is not verified', () => {
      it('should throw an error', () => {
        const mockContext = createMock<ExecutionContext>();
        mockContext.switchToHttp().getRequest.mockReturnValue({
          user: {
            emailVerified: false,
          },
        });

        expect(() => emailVerifiedGuard.canActivate(mockContext)).toThrow(
          new UnauthorizedException('Email is not verified yet'),
        );
      });
    });

    describe('When request has not an user', () => {
      it('should throw an exception', () => {
        const mockContext = createMock<ExecutionContext>();
        mockContext.switchToHttp().getRequest.mockReturnValue({});

        expect(() => emailVerifiedGuard.canActivate(mockContext)).toThrow(
          new UnauthorizedException('User is not valid'),
        );
      });
    });
  });
});
