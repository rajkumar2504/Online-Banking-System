# Security Notes

## Authentication

The API uses stateless JWT bearer authentication. Login creates a signed token,
and protected endpoints validate that token through `JwtAuthenticationFilter`.

## Authorization

Account endpoints scope owned account operations to the authenticated user's
email. This prevents users from reading or mutating accounts they do not own.

Ownership is required for:

- Account lookup
- Deposit
- Withdrawal
- Transaction history
- Transfer source account

Transfer destination accounts do not require ownership so users can transfer
money to another user's account.

## Secrets

The application expects secrets from environment variables:

- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`

Do not commit real credentials or production JWT secrets. Rotate any credential
that was previously committed to source control.

## Concurrency

Accounts use JPA optimistic locking with a `version` column. If two requests
try to update the same account state concurrently, one update can fail with a
`409 Conflict`, allowing the client to retry using fresh account state.

## Recommendations

- Use HTTPS in deployed environments.
- Use a strong Base64-encoded JWT secret.
- Keep JWT expiration appropriate for the client application.
- Disable SQL logging in production.
- Prefer database migrations over automatic schema updates for production.
- Add rate limiting around authentication endpoints.

