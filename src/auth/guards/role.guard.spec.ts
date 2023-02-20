import { RoleGuard } from './role.guard';
import { Reflector } from '@nestjs/core';
import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';

describe('RoleGuard', () => {
  let reflector: Reflector;
  let guard: RoleGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RoleGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true is user has the role', () => {
    reflector.get = jest.fn().mockReturnValue(['ADMIN', 'SUPER_ADMIN']);

    const mockContext = createMock<ExecutionContext>();
    mockContext.switchToHttp().getRequest.mockReturnValue({
      user: {
        roles: ['ADMIN', 'COSTUMER'],
      },
    });
    const canActivate = guard.canActivate(mockContext);

    expect(canActivate).toBe(true);
  });

  it('should return false is user has not the role', () => {
    reflector.get = jest.fn().mockReturnValue(['ADMIN', 'SUPER_ADMIN']);

    const mockContext = createMock<ExecutionContext>();
    mockContext.switchToHttp().getRequest.mockReturnValue({
      user: {
        roles: ['COSTUMER', 'BASE_USER'],
      },
    });
    const canActivate = guard.canActivate(mockContext);

    expect(canActivate).toBe(false);
  });
});
