# Project Documentation

## Overview

The Online Banking System is a Spring Boot REST API for core banking workflows:
user registration, authentication, account creation, deposits, withdrawals,
transfers, and transaction history.

The application is designed as a layered backend:

- Controllers expose HTTP endpoints and receive authenticated user context.
- Services contain business rules for ownership, balances, transfers, and transactions.
- Repositories persist users, accounts, and transactions through Spring Data JPA.
- Spring Security validates JWT bearer tokens for protected endpoints.
- MySQL stores production data, while H2 is used by integration tests.

## Technology Stack

- Java 17
- Spring Boot 3.2.5
- Spring Web
- Spring Security
- Spring Data JPA
- MySQL
- JWT with `jjwt`
- Lombok
- Springdoc OpenAPI / Swagger UI
- JUnit, Spring Boot Test, MockMvc, H2

## Main Modules

| Area | Package | Responsibility |
| --- | --- | --- |
| Application startup | `com.banking` | Spring Boot entry point |
| Controllers | `com.banking.controller` | REST API endpoints |
| Services | `com.banking.service` | Business interfaces |
| Service implementations | `com.banking.service.impl` | Banking and authentication logic |
| Models | `com.banking.model` | JPA entities and enums |
| Repositories | `com.banking.repository` | Database access |
| Security | `com.banking.security` | JWT generation, validation, and request filtering |
| Exceptions | `com.banking.exception` | API error mapping |
| DTOs | `com.banking.dto` | Request and response payloads |

## Request Flow

1. A client sends an HTTP request to the API.
2. Public authentication endpoints pass directly to `AuthController`.
3. Protected account endpoints pass through `JwtAuthenticationFilter`.
4. The JWT subject becomes the authenticated email.
5. `AccountController` passes that email to `AccountService`.
6. `AccountServiceImpl` loads accounts using `accountId + userEmail` for owned resources.
7. Repositories persist changes through JPA transactions.
8. Responses are mapped to DTOs before returning to the client.

## Business Rules

- Users register with a unique email and encrypted password.
- Login returns a bearer token.
- Account creation belongs to the authenticated user.
- Account lookup, deposit, withdrawal, and transaction history require ownership.
- Transfers require ownership of the source account.
- Transfer destination accounts may belong to another user.
- Deposits, withdrawals, and transfers require a positive amount.
- Withdrawals and transfers cannot overdraw the source account.
- Balance-changing operations run inside transactions.
- Accounts use optimistic locking through a JPA `@Version` field.

## Data Model

### User

Stores identity and authentication data:

- `id`
- `name`
- `email`
- `password`
- `role`

### Account

Stores bank account state:

- `id`
- `accountNumber`
- `balance`
- `version`
- `user`

### Transaction

Stores account activity:

- `id`
- `type`
- `amount`
- `timestamp`
- `account`
- `targetAccountId`

## Configuration

Runtime secrets are supplied through environment variables:

- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`

`JWT_SECRET` must be a Base64-encoded 256-bit or stronger secret. For local setup:

```bash
openssl rand -base64 32
```

## Testing

Integration tests are located under `src/test`. They run with the `test` profile,
use H2, and exercise the real Spring Security and JPA layers through MockMvc.

Covered flows:

- Registration and login
- Account ownership enforcement
- Insufficient balance handling
- Transfers
- Transaction history

Run tests:

```bash
mvn test
```

