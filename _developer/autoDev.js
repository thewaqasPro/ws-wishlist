import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import "dotenv/config";

// Port that Next.js runs on
const PORT = 3000;

function startCloudflareTunnel() {
  return new Promise((resolve, reject) => {
    console.log("--> Starting Cloudflare tunnel...");
    const cp = spawn(
      "npx",
      ["--yes", "cloudflared", "tunnel", "--url", `http://localhost:${PORT}`],
      {
        shell: true,
      }
    );

    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        cp.kill();
        reject(new Error("Timeout waiting for Cloudflare tunnel URL"));
      }
    }, 20000);

    const onData = (data) => {
      const str = data.toString();
      const m = str.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (m) {
        resolved = true;
        clearTimeout(timeout);
        resolve({ url: m[0], process: cp });
      }
    };

    cp.stdout.on("data", onData);
    cp.stderr.on("data", onData);

    cp.on("close", (code) => {
      if (!resolved) {
        clearTimeout(timeout);
        reject(new Error(`Cloudflare tunnel exited with code ${code}`));
      }
    });
  });
}

function runCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", shell: true });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else
        reject(new Error(`${cmd} ${args.join(" ")} failed with code ${code}`));
    });
  });
}

async function main() {
  let tunnelProcess = null;
  let nextProcess = null;

  const cleanup = () => {
    console.log("\n--> Cleaning up background processes...");
    if (tunnelProcess) {
      try {
        tunnelProcess.kill();
        console.log("--> Stopped Cloudflare tunnel process.");
      } catch (e) {}
    }
    if (nextProcess) {
      try {
        nextProcess.kill();
        console.log("--> Stopped Next.js dev server.");
      } catch (e) {}
    }
  };

  process.on("SIGINT", () => {
    cleanup();
    process.exit(0);
  });
  process.on("exit", cleanup);

  try {
    const tunnel = await startCloudflareTunnel();
    const publicUrl = tunnel.url;
    tunnelProcess = tunnel.process;
    console.log(`--> Cloudflare tunnel established: ${publicUrl}`);

    // 1. Update the .env file
    const envPath = path.join(process.cwd(), ".env");
    if (!fs.existsSync(envPath)) {
      throw new Error(".env file not found in root directory.");
    }
    let envContent = fs.readFileSync(envPath, "utf8");
    const appUrlRegex = /^SHOPIFY_APP_URL=.*/m;
    if (appUrlRegex.test(envContent)) {
      envContent = envContent.replace(
        appUrlRegex,
        `SHOPIFY_APP_URL=${publicUrl}`
      );
    } else {
      envContent += `\nSHOPIFY_APP_URL=${publicUrl}`;
    }
    fs.writeFileSync(envPath, envContent, "utf8");
    console.log("--> Updated SHOPIFY_APP_URL in .env");

    // Update process.env so inline tomlWriter execution gets the new URL
    process.env.SHOPIFY_APP_URL = publicUrl;

    // 2. Rewrite configurations
    console.log("--> Generating configuration files...");
    await runCommand("node", ["_developer/tomlWriter.js"]);

    // 3. Deploy configuration to Shopify Partner Dashboard
    console.log("--> Deploying configuration updates to Shopify Dashboard...");
    await runCommand("npx", ["shopify", "app", "deploy", "--allow-updates"]);

    // 4. Start NextJS dev server
    console.log("--> Starting Next.js development server...");
    nextProcess = spawn("npx", ["next", "dev"], {
      stdio: "inherit",
      shell: true,
    });

    nextProcess.on("close", (code) => {
      nextProcess = null;
      cleanup();
      process.exit(code);
    });
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    cleanup();
    process.exit(1);
  }
}

main();
