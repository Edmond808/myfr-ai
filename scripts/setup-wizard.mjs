#!/usr/bin/env node
// Interactive setup — no extra deps. Run: npm run setup
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createInterface } from "node:readline";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const SUPABASE_URL = "https://kivwsfwijgbwflvsrtqy.supabase.co";
const PROJECT_SQL =
  "https://supabase.com/dashboard/project/kivwsfwijgbwflvsrtqy/sql/new";
const PROJECT_API =
  "https://supabase.com/dashboard/project/kivwsfwijgbwflvsrtqy/settings/api";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_PATH = join(ROOT, ".env.local");

function parseEnvFile(path) {
  const vars = {};
  try {
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m) vars[m[1]] = m[2];
    }
  } catch {
    /* no file yet */
  }
  return vars;
}

function isPlaceholderKey(key) {
  return !key || /PASTE|your-anon-key/i.test(key);
}

function writeEnvLocal(anonKey, existing = {}) {
  const lines = [
    "# Rivly — created by npm run setup",
    "",
    `ANTHROPIC_API_KEY=${existing.ANTHROPIC_API_KEY ?? ""}`,
    "",
    `NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`,
    "",
  ];
  writeFileSync(ENV_PATH, lines.join("\n"));
}

function ask(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function printFailureHelp(output) {
  console.log("\n--- What to do next ---\n");

  if (/table .* missing|42P01/i.test(output)) {
    console.log("Your Supabase project is missing the Rivly database tables.");
    console.log("1. Open the SQL editor:");
    console.log(`   ${PROJECT_SQL}`);
    console.log(
      "2. Open the file supabase/00_RUN_THIS_IN_SUPABASE.sql in this project folder",
    );
    console.log("3. Copy everything, paste into Supabase, click Run");
    console.log("4. Run npm run setup again\n");
  }

  if (/accept_quote|dispatch_job|RPC .* missing/i.test(output)) {
    console.log(
      "Some database functions are still missing — run the full SQL file again (same steps as above).\n",
    );
  }

  if (/NEXT_PUBLIC_SUPABASE_ANON_KEY not set/i.test(output)) {
    console.log("The anon key was not saved. Run npm run setup and paste the key again.");
    console.log(`Get it here: ${PROJECT_API}\n`);
  }

  if (/NEXT_PUBLIC_SUPABASE_URL not set/i.test(output)) {
    console.log("Something went wrong writing .env.local. Run npm run setup again.\n");
  }

  if (!/missing|not set|42P01|RPC/i.test(output)) {
    console.log("Something did not pass. Read the red ✗ lines above.");
    console.log("If tables are missing, paste the SQL file first, then run npm run setup again.\n");
  }
}

async function runCheck() {
  return new Promise((resolve) => {
    const child = spawn("node", ["scripts/check-supabase.mjs"], {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk;
      process.stdout.write(chunk);
    });
    child.stderr.on("data", (chunk) => {
      output += chunk;
      process.stderr.write(chunk);
    });
    child.on("close", (code) => resolve({ code: code ?? 1, output }));
  });
}

async function main() {
  console.log("\nRivly setup\n");
  console.log("This saves your Supabase key and checks that everything works.\n");

  const existing = parseEnvFile(ENV_PATH);
  let anonKey = isPlaceholderKey(existing.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    ? null
    : existing.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  if (anonKey) {
    console.log("Found an anon key in .env.local.");
    const answer = (await ask(rl, "Use it? (Y/n): ")).trim().toLowerCase();
    if (answer === "n" || answer === "no") anonKey = null;
  }

  if (!anonKey) {
    console.log("\nPaste your Supabase anon key (one long string):");
    console.log("  Supabase → gear icon (Project Settings) → API → anon public\n");
    anonKey = (await ask(rl, "Anon key: ")).trim();
  }

  rl.close();

  if (!anonKey || anonKey.length < 30) {
    console.log("\nThat key does not look right.");
    console.log(`Copy the anon public key from:\n  ${PROJECT_API}\n`);
    process.exit(1);
  }

  writeEnvLocal(anonKey, existing);
  console.log("\nSaved .env.local\nChecking connection...\n");

  const { code, output } = await runCheck();

  if (code !== 0) {
    printFailureHelp(output);
    process.exit(1);
  }

  console.log("\nYou're all set.\n");
  console.log("Run ./scripts/dev.sh and open http://localhost:3000\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
