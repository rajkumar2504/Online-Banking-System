# API Documentation

Base URL:

```text
http://localhost:8080
```

Protected endpoints require:

```text
Authorization: Bearer <accessToken>
```

## Authentication

### Register

`POST /api/auth/register`

Request:

```json
{
  "name": "John Doe",
  "email": "johndoe@example.com",
  "password": "password123"
}
```

Response:

```text
User registered successfully!
```

### Login

`POST /api/auth/login`

Request:

```json
{
  "email": "johndoe@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "accessToken": "jwt-token",
  "tokenType": "Bearer"
}
```

## Accounts

### Create Account

`POST /api/account/create`

Request:

```json
{
  "initialBalance": 1000.00
}
```

### Get Account

`GET /api/account/{id}`

Requires ownership of the account.

### Deposit

`POST /api/account/deposit`

Request:

```json
{
  "accountId": 1,
  "amount": 500.00
}
```

Requires ownership of the account.

### Withdraw

`POST /api/account/withdraw`

Request:

```json
{
  "accountId": 1,
  "amount": 200.00
}
```

Requires ownership of the account and sufficient balance.

### Transfer

`POST /api/account/transfer`

Request:

```json
{
  "fromAccountId": 1,
  "toAccountId": 2,
  "amount": 300.00
}
```

Requires ownership of the source account. The destination account may belong to
another user.

### Transaction History

`GET /api/account/transactions/{accountId}?page=0&size=10`

Requires ownership of the account.

## Common Error Responses

| Status | Meaning |
| --- | --- |
| `400 Bad Request` | Validation failure, bad amount, insufficient balance |
| `401 Unauthorized` | Missing or invalid authentication |
| `404 Not Found` | Resource not found or not owned by the user |
| `409 Conflict` | Concurrent account update conflict |
| `500 Internal Server Error` | Unexpected server error |

