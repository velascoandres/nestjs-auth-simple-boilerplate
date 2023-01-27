export default {
  JWT_ACCESS_SECRET: '123',
  JWT_REFRESH_SECRET: '1234',
  JWT_EXPIRES: '45min',
  JWT_REFRESH_EXPIRES: '1y',
  JWT_VERIFICATION_TOKEN_SECRET: '123',
  JWT_VERIFICATION_TOKEN_EXPIRATION_TIME: '21600s',
  JWT_FORGOT_PASSWORD_TOKEN_SECRET: '123',
  JWT_FORGOT_PASSWORD_TOKEN_EXPIRATION_TIME: '21600s',
  FORGOT_PASSWORD_URL: 'https://my-app.com/auth/restore-password',
  MAIL_HOST: 'smtp://provider.com',
  EMAIL_CONFIRMATION_URL: 'https://localhost/auth/confirm-email',
  MAIL_USER: 'user@mail.com',
  MAIL_PASSWORD: '123',

  JWT_CHANGE_EMAIL_TOKEN_SECRET: '123',
  JWT_CHANGE_EMAIL_TOKEN_SECRET_EXPIRATION_TIME: '21600s',
  NEW_EMAIL_CONFIRMATION_URL: 'http://my-app.com/auth/email/confirm-new-email',
};
