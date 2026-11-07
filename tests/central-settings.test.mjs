import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
import { stripTypeScriptTypes } from "node:module";

function script(path) {
  return stripTypeScriptTypes(fs.readFileSync(path, "utf8"), { mode: "transform" })
    .replace(/import[\s\S]*?from\s+["'][^"']+["'];/g, "")
    .replace(/export\s+/g, "");
}

const calls = [];
let response = { ok: true, json: async () => ({ status: "success", data: {
  site_name: "Central", site_logo: "https://pos.aftsoftandlimited.com/storage/logo.png",
} }) };
const context = vm.createContext({
  Headers,
  process: { env: {} },
  fetch: async (url, init) => { calls.push({ url, init }); return response; },
});
for (const path of ["src/lib/central-api.ts", "src/lib/asset-url.ts", "src/lib/api.ts", "src/services/settings.service.ts"]) {
  vm.runInContext(script(path), context);
}

for (const suffix of ["", "/api", "/api/v1", "/api/v1/central", "/api/v1/storefront"]) {
  context.process.env.NEXT_PUBLIC_API_URL = `https://backend.example${suffix}`;
  const result = await vm.runInContext("settingsService.getAll()", context);
  assert.equal(calls.at(-1).url, "https://backend.example/api/v1/central/settings");
  assert.equal(calls.at(-1).init.headers.has("X-Store-Host"), false);
  assert.equal(calls.at(-1).init.cache, "no-store");
  assert.equal(result.success, true);
  assert.equal(result.data.site_name, "Central");
}
context.process.env.NEXT_PUBLIC_BACKEND_URL = "https://assets.example";
assert.equal((await vm.runInContext("settingsService.getAll()", context)).data.site_logo,
  "https://assets.example/storage/logo.png");

response = { ok: false, status: 503, json: async () => ({ message: "Unavailable" }) };
await assert.rejects(() => vm.runInContext("settingsService.getAll()", context),
  error => error.name === "ApiError" && error.status === 503 && error.message === "Unavailable");
response = { ok: false, status: 502, json: async () => { throw Error("Not JSON"); } };
await assert.rejects(() => vm.runInContext("settingsService.getAll()", context),
  error => error.name === "ApiError" && error.status === 502);
console.log("Central settings transport: URL variants, tenant-free requests, normalization, asset rewrite and errors pass.");
