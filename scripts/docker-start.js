import { validateRuntimeEnvironment } from "./runtime-env.js";
import { spawn, spawnSync } from "node:child_process";

try {
  validateRuntimeEnvironment();
} catch (error) {
  console.error(`Runtime configuration error: ${error.message}`);
  process.exit(1);
}

const migration = spawnSync(process.execPath, ["scripts/migrate.js"], {
  stdio: "inherit",
  env: process.env,
});

if (migration.status !== 0) {
  process.exit(migration.status || 1);
}

const server = spawn("npm", ["run", "start"], {
  stdio: "inherit",
  env: process.env,
});

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => server.kill(signal));
}

server.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code || 0);
});
