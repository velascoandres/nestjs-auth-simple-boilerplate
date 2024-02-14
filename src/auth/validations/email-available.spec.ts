import type { UsersService } from '../../users/users.service';

import { EmailAvailableConstraint } from './email-available';

const userServiceMock: Partial<UsersService> = {
  findUserByEmail: jest.fn(),
};

describe('EmailAvailableConstraint tests', () => {
  beforeEach(() => {
    userServiceMock.findUserByEmail = jest.fn().mockResolvedValue({ id: 1 });
  });

  describe('When some user exists with the given email', () => {
    it('should return false', async () => {
      const validator = new EmailAvailableConstraint(
        userServiceMock as UsersService,
      );

      const result = await validator.validate('test@email.com');

      expect(result).toBe(false);
    });
  });

  describe('When nobody user exists with the given email', () => {
    beforeEach(() => {
      userServiceMock.findUserByEmail = jest.fn().mockResolvedValue(null);
    });

    it('should return true', async () => {
      const validator = new EmailAvailableConstraint(
        userServiceMock as UsersService,
      );

      const result = await validator.validate('test@email.com');

      expect(result).toBe(true);
    });
  });
});
