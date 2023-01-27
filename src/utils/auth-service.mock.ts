import { AuthEmailService } from '../auth/auth-email.service';

export const mockEmailService = () => {
  const authEmailService = {
    provide: AuthEmailService,
    useValue: {
      sendVerificationLink: jest.fn(() => {
        return 'some-mock';
      }),
      sendForgotPasswordLink: jest.fn(() => true),
      sendNewEmailVerificationLink: jest.fn(() => true),
    },
  };

  return authEmailService;
};
