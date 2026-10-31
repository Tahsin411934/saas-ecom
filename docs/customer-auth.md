# Storefront customer authentication

Customer signup/login now use /api/v1/storefront/auth/register and /auth/login.
Accounts are written to the backend customers table with the resolved store_id.
The backend customer payload is exposed as user to existing UI components.

The frontend forwards its request Host as X-Store-Host. That domain must be
registered to an active store in the backend. For local development or a fixed
storefront behind a reverse proxy, set the server-only environment variable:

STOREFRONT_HOST=your-registered-store-domain.com

Do not use the backend admin domain for this value. Restart the frontend after
changing environment variables. NEXT_PUBLIC_API_URL can contain the backend
origin, /api, /api/v1, or /api/v1/storefront; the transport normalizes the prefix.

Customer profile, password reset/change, logout, refresh, cart, checkout,
wishlist, orders and review submission use the same store context and token.
Public catalog requests keep their existing endpoints. Cart and checkout accept
only products belonging to the resolved store, as enforced by the backend.
Existing users-table accounts/tokens are not migrated: customers must register
or sign in using an account in this store's customers table.
