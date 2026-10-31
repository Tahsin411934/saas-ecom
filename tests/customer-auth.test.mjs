import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
import { stripTypeScriptTypes } from "node:module";

function script(path) {
  return stripTypeScriptTypes(fs.readFileSync(path, "utf8"))
    .replace(/import[\s\S]*?from\s+["'][^"']+["'];/g, "")
    .replace(/export\s+/g, "");
}
const calls = [], writes = [];
const context = {
  Headers, process: { env: { NEXT_PUBLIC_API_URL: "https://backend.example/api/v1" } },
  headers: async () => new Headers({ host: "shop.example" }),
  fetch: async (url, init) => {
    calls.push({ url, init });
    return { ok: true, status: 200, json: async () => ({ status: "success", message: "Welcome", data: { customer: { id: 7 }, token: "customer-token" } }) };
  },
  cookies: async () => ({ get: () => ({ value: "customer-token" }), set: (...args) => writes.push(args), delete() {} }),
  redirect: () => { throw Error("NEXT_REDIRECT"); },
};
vm.createContext(context);
vm.runInContext(script("src/lib/storefront-api.ts"), context);
vm.runInContext(script("src/app/actions/auth.ts"), context);
const form = { get: key => ({ email: "customer@example.com", password: "password123", first_name: "Test", last_name: "Customer", password_confirmation: "password123" }[key] ?? null) };
const login = await context.loginAction({}, form);
assert.equal(login.success, true);
assert.equal(login.user.id, 7);
assert.equal(writes[0][2].httpOnly, true);
assert.equal(calls[0].url, "https://backend.example/api/v1/storefront/auth/login");
assert.equal(calls[0].init.headers.get("X-Store-Host"), "shop.example");
await assert.rejects(() => context.registerUser({}, form), /NEXT_REDIRECT/);
assert.equal(calls.at(-1).url, "https://backend.example/api/v1/storefront/auth/register");
assert.equal((await context.getAuthenticatedUserAction()).user.id, 7);
assert.equal(calls.at(-1).url, "https://backend.example/api/v1/storefront/auth/me");
await context.changePasswordAction({}, form);
assert.equal(calls.at(-1).init.headers.get("Authorization"), "Bearer customer-token");
for (const base of ["https://backend.example", "https://backend.example/api", "https://backend.example/api/v1", "https://backend.example/api/v1/storefront"]) {
  context.process.env.NEXT_PUBLIC_API_URL = base;
  await context.storefrontFetch("/auth/login");
  assert.equal(calls.at(-1).url, "https://backend.example/api/v1/storefront/auth/login");
}
context.process.env.STOREFRONT_HOST = "registered.example";
await context.storefrontFetch("auth/me");
assert.equal(calls.at(-1).init.headers.get("X-Store-Host"), "registered.example");
console.log("PASS: customer auth, cookies, tenant headers, password token and API URL normalization");

const beforeFailure = writes.length;
context.fetch = async () => ({ ok: false, status: 422, json: async () => ({ message: "Invalid email", errors: { email: ["Invalid email"] } }) });
const failed = await context.loginAction({}, form);
assert.equal(failed.success, false);
assert.equal(failed.errors.email[0], "Invalid email");
assert.equal(writes.length, beforeFailure);
console.log("PASS: validation failure preserves field errors and does not write an auth cookie");
