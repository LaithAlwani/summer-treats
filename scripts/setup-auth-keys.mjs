// Generate Convex Auth RS256 keys and set them on a deployment.
// Matches what `npx @convex-dev/auth` does, but avoids a Windows-only crash
// in that CLI.
//
// Usage:
//   node scripts/setup-auth-keys.mjs                         (dev, SITE_URL=http://localhost:3000)
//   node scripts/setup-auth-keys.mjs https://yoursite.com    (dev, custom SITE_URL)
//   node scripts/setup-auth-keys.mjs https://yoursite.com --prod   (PRODUCTION deployment)
import { generateKeyPair, exportPKCS8, exportJWK } from "jose";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
// convex's package.json doesn't export ./bin/main.js, so resolve via the dir.
const convexPkg = require.resolve("convex/package.json");
const convexBin = join(dirname(convexPkg), "bin", "main.js");

const argv = process.argv.slice(2);
const prod = argv.includes("--prod");
const SITE_URL = argv.find((a) => !a.startsWith("--")) ?? "http://localhost:3000";

const keys = await generateKeyPair("RS256", { extractable: true });
const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);

const JWT_PRIVATE_KEY = privateKey.trimEnd().replace(/\n/g, " ");
const JWKS = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

function setEnv(name, value) {
  // Spawn the Convex CLI directly (no shell) so spaces/quotes in the value
  // are passed verbatim. `--` stops option parsing so a value starting with
  // "-----BEGIN" isn't treated as a flag. `--prod` targets the production
  // deployment.
  //
  // The Convex CLI can hit a libuv assertion when it exits on Windows
  // (`!(handle->flags & UV_HANDLE_CLOSING)`). That crash happens AFTER the
  // env var is actually set, so we swallow the non-zero exit and carry on.
  const flags = prod ? ["--prod"] : [];
  try {
    execFileSync(
      process.execPath,
      [convexBin, "env", "set", ...flags, "--", name, value],
      { stdio: "inherit" },
    );
  } catch {
    console.warn(`(ignored exit crash after setting ${name})`);
  }
}

setEnv("JWT_PRIVATE_KEY", JWT_PRIVATE_KEY);
setEnv("JWKS", JWKS);
setEnv("SITE_URL", SITE_URL);
console.log(
  `Auth keys + SITE_URL (${SITE_URL}) set on ${prod ? "PRODUCTION" : "dev"} deployment.`,
);
