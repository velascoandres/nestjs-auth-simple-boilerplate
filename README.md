## Description
A Nest.js boilerplate with authentication with jwt, verification emails, etc.


## Installation
Clone this repository. Set up your virtual environment (optional but recommended). Copy the contents of .env.example into a new file named .env and configure the required variables.

```text
APP_PORT=3000

# Postgres connnection uri from docker-compose file (dev and testing)
POSTGRES_URL="postgresql://bl_pg_user:bl_pg_password@localhost:4848/bl_pg_local_db"
POSTGRES_TEST_URL="postgresql://test_user:test_password@localhost:4949/bl_pg_test_db"

JWT_ACCESS_SECRET="KEY_SECRET"
JWT_REFRESH_SECRET="KEY_SECRET"
JWT_EXPIRES="45min"
JWT_REFRESH_EXPIRES="1y"


JWT_VERIFICATION_TOKEN_SECRET="123"
JWT_VERIFICATION_TOKEN_EXPIRATION_TIME="21600s"
EMAIL_CONFIRMATION_URL="http://localhost:3000/auth/email/confirm-email"


JWT_FORGOT_PASSWORD_TOKEN_SECRET="123"
JWT_FORGOT_PASSWORD_TOKEN_EXPIRATION_TIME="21600s"
FORGOT_PASSWORD_URL="http://localhost:3000/auth/restore-password"


MAIL_HOST=smtp.example.com
MAIL_USER=examples@mail.com
MAIL_PASSWORD=some-password
MAIL_FROM=noreply@example.com
```


```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
