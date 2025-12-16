rm -rf .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*


CI=true NO_D1_WARNING=true npx wrangler d1 migrations apply hono-auth-api-db-development --env development
CI=true NO_D1_WARNING=true npx wrangler d1 migrations apply hono-auth-api-db-test --env test

npx wrangler d1 execute hono-auth-api-db-development --env development --local --file ./tools/d1/seeds.sql

npx wrangler d1 execute hono-auth-api-db-test --env test --local --file ./tools/d1/seeds.sql

