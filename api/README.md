# Bank Sync API (Azure Static Web Apps Functions)

This folder contains HTTP-triggered Azure Functions used for bank account linking and transaction sync.

## Endpoints

Authentication endpoints:

- POST /api/auth/profile
  - Requires Authorization: Bearer <access_token>
  - Request body: { "fullName": "...", "phoneNumber": "...", "twoFactorMethod": "sms" | "totp" }
  - Response: { "success": true, "profile": {...} }

- POST /api/auth/migrate-device
  - Requires Authorization: Bearer <access_token>
  - Request body: { "deviceId": "legacy-device-id" }
  - Response: { "success": true, "migrated": true | false, "message": "..." }

Bank endpoints:

- POST /api/bank/link-token
  - Requires Authorization: Bearer <access_token>
  - Request body: {}
  - Response: { "linkToken": "...", "expiration": "..." }

- POST /api/bank/exchange-token
  - Requires Authorization: Bearer <access_token>
  - Request body: { "publicToken": "...", "institutionName": "..." }
  - Response: { "success": true, "itemId": "..." }

- POST /api/bank/connections
  - Requires Authorization: Bearer <access_token>
  - Request body: {}
  - Response: { "success": true, "accounts": [{ "item_id": "...", "institution_name": "...", "updated_at": "..." }] }

- POST /api/bank/sync-transactions
  - Requires Authorization: Bearer <access_token>
  - Request body: {}
  - Response: { "success": true, "importedCount": number, "removedCount": number, "lastSyncedAt": "...", "transactions": [...] }

## Runtime Environment Variables

Set these in Azure Static Web Apps configuration:

- PLAID_CLIENT_ID
- PLAID_SECRET
- PLAID_ENV (sandbox, development, production)
- PLAID_COUNTRY_CODES (optional, comma-separated ISO codes such as US or US,CA)
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

## Notes

- This API is designed for backend-only secrets. Do not expose server secrets to Vite client variables.
- All bank endpoints are now user-scoped through JWT auth. They no longer trust client-provided profile identifiers.
- Current implementation stores Plaid `access_token` in `bank_connections`. For production hardening, encrypt or vault the token.
