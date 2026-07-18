const REQUIRED = [
  "DATABASE_URL",
  "SHOPIFY_API_KEY",
  "SHOPIFY_API_SECRET",
  "SHOPIFY_API_SCOPES",
  "SHOPIFY_APP_URL",
  "SHOPIFY_API_VERSION",
  "ENCRYPTION_STRING",
  "APP_NAME",
  "APP_HANDLE",
  "APP_PROXY_PREFIX",
  "APP_PROXY_SUBPATH",
];

const PLACEHOLDER =
  /(?:replace[_-]?me|change[_-]?me|placeholder|example\.com)/i;
const VALID_PROXY_PREFIXES = new Set(["apps", "a", "community", "tools"]);

export function validateRuntimeEnvironment(env = process.env) {
  const missing = REQUIRED.filter((name) => !String(env[name] || "").trim());
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  const unsafe = REQUIRED.filter((name) => PLACEHOLDER.test(String(env[name])));
  if (unsafe.length) {
    throw new Error(
      `Placeholder production values are not allowed: ${unsafe.join(", ")}`
    );
  }

  let appUrl;
  try {
    appUrl = new URL(env.SHOPIFY_APP_URL);
  } catch {
    throw new Error("SHOPIFY_APP_URL must be a valid absolute URL");
  }
  if (appUrl.protocol !== "https:") {
    throw new Error("SHOPIFY_APP_URL must use HTTPS");
  }

  if (!/^postgres(?:ql)?:\/\//i.test(env.DATABASE_URL)) {
    throw new Error("DATABASE_URL must be a PostgreSQL connection string");
  }
  if (String(env.ENCRYPTION_STRING).length < 32) {
    throw new Error("ENCRYPTION_STRING must contain at least 32 characters");
  }
  if (!VALID_PROXY_PREFIXES.has(env.APP_PROXY_PREFIX)) {
    throw new Error(
      "APP_PROXY_PREFIX must be one of: apps, a, community, tools"
    );
  }
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(env.APP_HANDLE)) {
    throw new Error(
      "APP_HANDLE must contain only letters, numbers, and hyphens"
    );
  }
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(env.APP_PROXY_SUBPATH)) {
    throw new Error(
      "APP_PROXY_SUBPATH must contain only letters, numbers, and hyphens"
    );
  }

  return true;
}
