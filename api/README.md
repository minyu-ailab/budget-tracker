# Bank Sync API (Azure Static Web Apps Functions)

This folder contains HTTP-triggered Azure Functions used for bank account linking and transaction sync.

## Endpoints

- POST /api/bank/link-token
  - Request body: { "profileId": "<device-or-user-id>" }
  - Response: { "linkToken": "...", "expiration": "..." }

- POST /api/bank/exchange-token
  - Request body: { "profileId": "...", "publicToken": "...", "institutionName": "..." }
  - Response: { "success": true, "itemId": "..." }

- POST /api/bank/sync-transactions
  - Request body: { "profileId": "..." }
  - Response: { "success": true, "importedCount": number, "removedCount": number }

## Runtime Environment Variables

Set these in Azure Static Web Apps configuration:

- PLAID_CLIENT_ID
- PLAID_SECRET
- PLAID_ENV (sandbox, development, production)
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

## Notes

- This API is designed for backend-only secrets. Do not expose server secrets to Vite client variables.
- `profileId` should be replaced by an authenticated user id when auth is added.
- Current implementation stores Plaid `access_token` in `bank_connections`. For production hardening, encrypt or vault the token.
