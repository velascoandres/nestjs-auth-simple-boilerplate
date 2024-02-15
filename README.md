


<h1 align="center">
    Nestjs auth simple boilerplate
</h1>



<p align="center">
<img src="https://img.shields.io/github/discussions/velascoandres/nestjs-auth-simple-boilerplate" alt="GitHub discussions" />
<img src="https://img.shields.io/github/issues/velascoandres/nestjs-auth-simple-boilerplate" alt="GitHub issues" />
<img src="https://img.shields.io/github/issues-pr/velascoandres/nestjs-auth-simple-boilerplate" alt="GitHub pull request" />
</p>

## Description
A Nest.js boilerplate with authentication with jwt, verification emails, etc.



## 🔍 Table of Contents

* [⭐️ Highlights](#highlights)

* [💻 Stack](#stack)

* [📝 Project Summary](#project-summary)

* [⚙️ Setting Up](#setting-up)

* [🚀 Run Locally](#run-locally)

* [🧪 Run tests](#run-tests)


## ⭐️ Highlights
* JWT Authentication
* Refresh JWT token 
* Send/Resend confirmation emails
* Change user password
* Change user email (email confirmation)

## 💻 Stack

- [nestjs/typeorm](https://github.com/nestjs/typeorm): Integration of TypeORM with NestJS for database management.
- [nestjs/swagger](https://github.com/nestjs/swagger): Generates OpenAPI (Swagger) documentation for the NestJS application.
- [nestjs/jwt](https://github.com/nestjs/jwt): JWT (JSON Web Token) authentication module for NestJS.
- [nestjs/passport](https://github.com/nestjs/passport): Authentication module for NestJS that supports various strategies.
- [nestjs/config](https://github.com/nestjs/config): Configuration module for NestJS applications.



## 📝 Project Summary

- [**src/auth**](src/auth): Handles authentication-related functionalities such as decorators, guards, strategies, and validations.
- [**src/core**](src/core): Contains core project files and utilities.
- [**src/users**](src/users): Manages user-related functionalities including DTOs, entities, enums, and fixtures.
- [**src/test-utils**](src/test-utils): Provides utilities for testing purposes.
- [**templates**](templates): Holds template files for the project.
- [**views**](views): Manages view files for the project.

## ⚙️ Setting Up

Clone this repository. Set up your virtual environment (optional but recommended). Copy the contents of .env.example into a new file named .env and configure the required variables.

```text
APP_PORT=3000

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

#### APP_PORT
- Choose a port number for your application (e.g., 3000, 8080).

#### POSTGRES_URL
- Replace `bl_pg_user` with the username for your PostgreSQL database.
- Replace `bl_pg_password` with the password for your PostgreSQL database.
- Replace `localhost:4848` with the host and port of your PostgreSQL database.
- Replace `bl_pg_local_db` with the name of your PostgreSQL database.
> If you modified these values make sure to changes in the docker-compose file if you want to use it.

#### POSTGRES_TEST_URL
- Replace `test_user` with the username for your test PostgreSQL database.
- Replace `test_password` with the password for your test PostgreSQL database.
- Replace `localhost:4949` with the host and port of your test PostgreSQL database.
- Replace `bl_pg_test_db` with the name of your test PostgreSQL database.

> If you modified these values make sure to changes in the docker-compose file if you want to use it.

#### JWT_ACCESS_SECRET
- Generate a secret key for signing JWT access tokens.

#### JWT_REFRESH_SECRET
- Generate a secret key for signing JWT refresh tokens.

#### JWT_EXPIRES
- Set the expiration time for JWT access tokens (e.g., 45min, 1h).

#### JWT_REFRESH_EXPIRES
- Set the expiration time for JWT refresh tokens (e.g., 1d, 1y).

#### JWT_VERIFICATION_TOKEN_SECRET
- Generate a secret key for signing JWT verification tokens.

#### JWT_VERIFICATION_TOKEN_EXPIRATION_TIME
- Set the expiration time for JWT verification tokens (e.g., 21600s for 6 hours).

#### EMAIL_CONFIRMATION_URL
- Set the URL where users will be redirected to confirm their email addresses.

#### JWT_FORGOT_PASSWORD_TOKEN_SECRET
- Generate a secret key for signing JWT forgot password tokens.

#### JWT_FORGOT_PASSWORD_TOKEN_EXPIRATION_TIME
- Set the expiration time for JWT forgot password tokens (e.g., 21600s for 6 hours).

#### FORGOT_PASSWORD_URL
- Set the URL where users will be redirected to reset their passwords.

#### MAIL_HOST
- Set the hostname of your email server (e.g., smtp.example.com).

#### MAIL_USER
- Set the email address or username for authenticating with your email server.

#### MAIL_PASSWORD
- Set the password for authenticating with your email server.

#### MAIL_FROM
- Set the "From" email address that will be used for sending emails.


## 🚀 Run Locally
1. If you want to use the docker-compose file:
```sh
docker compose up -D
```
2.Install the dependencies with one of the package managers listed below:
```bash
pnpm install
```
3.Start the development mode:
```bash
pnpm start:dev
```

## 🧪 Run tests
1. Run unit tests
```sh
pnpm test
```
2. Run coverage
```sh
pnpm test:cov
```


