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
vm.runInContext(script("src/lib/central-api.ts"), context);
vm.runInContext(script("src/app/actions/auth.ts"), context);
const form = { get: key => ({ email: "customer@example.com", password: "password123", first_name: "Test", last_name: "Customer", password_confirmation: "password123" }[key] ?? null) };
const login = await context.loginAction({}, form);
assert.equal(login.success, true);
assert.equal(login.user.id, 7);
assert.equal(writes[0][2].httpOnly, true);
assert.equal(calls[0].url, "https://backend.example/api/v1/central/auth/login");
assert.equal(calls[0].init.headers.has("X-Store-Host"), false);
await assert.rejects(() => context.registerUser({}, form), /NEXT_REDIRECT/);
assert.equal(calls.at(-1).url, "https://backend.example/api/v1/central/auth/register");
assert.equal((await context.getAuthenticatedUserAction()).user.id, 7);
assert.equal(calls.at(-1).url, "https://backend.example/api/v1/central/auth/me");
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
for (const base of ["https://backend.example", "https://backend.example/api", "https://backend.example/api/v1", "https://backend.example/api/v1/central"]) {
  context.process.env.NEXT_PUBLIC_API_URL = base;
  await context.centralFetch("auth/login", { headers: { "X-Store-Host": "untrusted.example" } });
  assert.equal(calls.at(-1).url, "https://backend.example/api/v1/central/auth/login");
  assert.equal(calls.at(-1).init.headers.has("X-Store-Host"), false);
}
console.log("PASS: separate central auth without store header; existing storefront transport retained; cookies and password tokens");

const beforeFailure = writes.length;
context.fetch = async () => ({ ok: false, status: 422, json: async () => ({ message: "Invalid email", errors: { email: ["Invalid email"] } }) });
const failed = await context.loginAction({}, form);
assert.equal(failed.success, false);
assert.equal(failed.errors.email[0], "Invalid email");
assert.equal(writes.length, beforeFailure);
console.log("PASS: validation failure preserves field errors and does not write an auth cookie");

// Exercise real route-handler logic with backend transport and cookie mocks.
let routeToken = "existing-customer-token";
let routeCalls = [], routeWrites = [], routeDeletes = [];
let responseBody = { status: "success", data: { customer: { id: 9 }, token: "new-token" } };
let backendStatus = 200;
class MockNextResponse extends Response {
  static json(data, init) { return new MockNextResponse(JSON.stringify(data), init); }
}
const routeContext = {
  Headers, Request, Response, NextResponse: MockNextResponse,
  process: { env: { NODE_ENV: "production" } },
  cookies: async () => ({ get: () => routeToken ? { value: routeToken } : undefined, set: (...args) => routeWrites.push(args), delete: name => routeDeletes.push(name) }),
  centralFetch: async (path, init) => {
    routeCalls.push({ path, init });
    return new Response(JSON.stringify(responseBody), { status: backendStatus, headers: { "Content-Type": "application/json" } });
  },
};
vm.createContext(routeContext);
vm.runInContext(script("src/app/api/auth/[action]/route.ts"), routeContext);
function authPost(action) {
  return routeContext.POST(new Request("https://frontend.example/api/auth/" + action, { method: "POST", body: "{}" }), { params: Promise.resolve({ action }) });
}
assert.equal((await authPost("login")).status, 200);
assert.equal(routeCalls.at(-1).path, "auth/login");
assert.equal(routeCalls.at(-1).init.headers.Authorization, undefined);
assert.equal(routeWrites.at(-1)[1], "new-token");
assert.equal(routeWrites.at(-1)[2].httpOnly, true);
assert.equal(routeWrites.at(-1)[2].secure, true);
const signup = await authPost("register");
assert.equal((await signup.json()).user.id, 9);
assert.equal(routeCalls.at(-1).path, "auth/register");
responseBody = { status: "success", data: null };
await authPost("logout");
assert.equal(routeCalls.at(-1).init.headers.Authorization, "Bearer existing-customer-token");
assert.equal(routeDeletes.at(-1), "token");
responseBody = { status: "success", data: { token: "refreshed-token" } };
await authPost("refresh");
assert.equal(routeWrites.at(-1)[1], "refreshed-token");
routeToken = "";
const beforeUnauthorized = routeCalls.length;
assert.equal((await authPost("change-password")).status, 401);
assert.equal(routeCalls.length, beforeUnauthorized);
assert.equal((await authPost("unexpected")).status, 404);
backendStatus = 422;
responseBody = { message: "Validation failed", errors: { email: ["Already registered"] } };
assert.equal((await authPost("register")).status, 422);
assert.equal(routeWrites.at(-1)[1], "refreshed-token");
backendStatus = 200;
routeToken = "central-token";
responseBody = { status: "success", data: { customer: { id: 9 } } };
const meContext = vm.createContext({ ...routeContext });
vm.runInContext(script("src/app/api/me/route.ts"), meContext);
assert.equal((await (await meContext.GET()).json()).user.id, 9);
assert.equal(routeCalls.at(-1).path, "auth/me");
const proxyContext = vm.createContext({ ...routeContext });
vm.runInContext(script("src/lib/proxy.ts"), proxyContext);
await proxyContext.proxyApiRequest("/api/v1/orders");
assert.equal(routeCalls.at(-1).path, "orders");
assert.equal(routeCalls.at(-1).init.headers.Authorization, "Bearer central-token");
await proxyContext.proxyApiRequest("/api/v1/carts/sync", new Request("https://frontend.example/api/cart/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: [] }) }));
assert.equal(routeCalls.at(-1).path, "carts/sync");
assert.equal(routeCalls.at(-1).init.body, JSON.stringify({ items: [] }));
routeToken = "";
assert.equal((await proxyContext.proxyApiRequest("/api/v1/orders")).status, 401);
console.log("PASS: signup/login route mapping, secure cookies, logout, refresh, auth guards, validation errors, me and commerce proxy");
