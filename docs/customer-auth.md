# Central and storefront customer accounts

Central signup/login use:
- POST /api/v1/central/auth/register
- POST /api/v1/central/auth/login

Central accounts live in customers with store_id = NULL. No store domain or
X-Store-Host header is required. Existing storefront endpoints and transport
remain separate and keep store_id ownership.

Deploy the backend and run php artisan migrate --force before deploying this
frontend. The migration makes customers.store_id nullable and adds a generated
unique central_email index so concurrent central registrations cannot create
duplicate emails. The existing per-store email index remains intact.

NEXT_PUBLIC_API_URL specifies the backend origin (optionally ending in /api or
/api/v1). Central auth ignores STOREFRONT_HOST. Existing users-table accounts
are not migrated automatically; central customers register in customers.

The central auth family also provides me, logout, logout-all, refresh,
forgot-password, reset-password and change-password. Customer tokens stay in
an HttpOnly cookie. Central cart, checkout, wishlist, orders and review
submission use /api/v1/central and customer_id ownership, keeping users.id
and storefront customer accounts isolated. Central checkout splits mixed
store carts into one order per seller.

Run node tests/customer-auth.test.mjs for mocked transport/action regression
checks (Node 24 or a version supporting node:module stripTypeScriptTypes).
