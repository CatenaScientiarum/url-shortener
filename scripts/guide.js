import inquirer from "inquirer"; // https://www.npmjs.com/package/inquirer (A collection of common interactive command line user interfaces.)
import { exec } from "child_process"; // allows running terminal commands (like npm run ...)
import fs from "fs"; // used to check if folders (like node_modules) exist

// Helper: run a script/command and return exit code
function runScript(command) {
  return new Promise((resolve) => {
    console.log(`\n🔵  Running: ${command}\n`);

    // execute the command in a shell
    const proc = exec(command, { shell: true });

    // Idea was taken from this issue https://github.com/SBoudrias/Inquirer.js/issues/1358
    // pipe output from the command into our terminal
    proc.stdout?.pipe(process.stdout);
    proc.stderr?.pipe(process.stderr);
    // 1. `proc` — this is the process we start via `exec(command)`.
    //    Every process in Node.js has its own input/output streams:
    //    - `proc.stdout` → standard output stream (what the process normally prints, e.g., via `console.log`).
    //    - `proc.stderr` → standard error stream (errors, warnings, etc.).

    // 2. `?.` (optional chaining)
    //    This is the optional chaining operator.
    //    It ensures that we don’t get an error if `proc.stdout` or `proc.stderr` is `undefined`.
    //    - If the object exists → `.pipe(...)` is called.
    //    - If not → the line is skipped safely.

    // 3. `.pipe(process.stdout)`
    //    The `.pipe()` method takes data from one stream and forwards it into another.
    //    - `proc.stdout.pipe(process.stdout)` means:
    //      → everything the child process writes to its stdout will be immediately shown in our main process’s console.

    //    Same for `stderr`:
    //    - `proc.stderr.pipe(process.stderr)` means:
    //      → all errors from the child process will appear in our Node.js app’s standard error stream (usually shown as red text in the terminal).

    // resolve when process finishes
    proc.on("exit", (code) => resolve(code));
  });
}

// Check if dependencies installed
async function ensureDependencies() {
  if (
    // check if node_modules folder exists in root, frontend, backend
    !fs.existsSync("node_modules") ||
    !fs.existsSync("frontend/node_modules") ||
    !fs.existsSync("backend/node_modules")
  ) {
    console.log("\n🔰 Installing dependencies... 🔰\n");
    // if missing -> install everything
    await runScript("npm run install-all");
  }
}

// Try to run command with auto-recovery
async function safeRun(script) {
  // try running the script
  let code = await runScript(`npm run ${script}`);

  // if it fails (non-zero exit code) -> propose fixes
  if (code !== 0) {
    console.log(`\n⚠️ Command 'npm run ${script}' failed.`);

    // ask user how to proceed
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "Do you want to try to fix it?",
        choices: [
          {
            name: "🧰 Run install-all (install all dependencies)",
            value: "install-all",
          },
          { name: "🛠️  Run fix (update your node js)", value: "fix" },
          { name: "Cancel", value: "cancel" },
        ],
      },
    ]);

    // if user picks install-all or fix -> run that script
    if (action !== "cancel") {
      await runScript(`npm run ${action}`);
    }
  }
}

// Menu for "User" role
async function userMenu() {
  const { launchType } = await inquirer.prompt([
    {
      type: "list",
      name: "launchType",
      message: "Launch mode:",
      choices: [
        { name: "⚙️  Automatic (Backend + Frontend)", value: "auto" },
        { name: "🔩 Manual (Choose yourself)", value: "manual" },
        { name: "↩️  Back", value: "back" },
      ],
    },
  ]);

  if (launchType === "auto") {
    // run both frontend + backend
    await safeRun("launch");
  } else if (launchType === "manual") {
    const { choice } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "choice",
        message: "Select what to run:",
        choices: [
          { name: "🚀 Backend", value: "launch:backend" },
          { name: "🌐 Frontend", value: "launch:frontend" },
        ],
      },
    ]);

    // run selected parts
    for (const c of choice) {
      await safeRun(c);
    }
  }
}

// Menu for "Dev" role
async function devMenu() {
  const { devChoice } = await inquirer.prompt([
    {
      type: "list",
      name: "devChoice",
      message: "Developer options:",
      choices: [
        { name: "🚀 Launch Backend", value: "launch:backend" },
        { name: "🌐 Launch Frontend", value: "launch:frontend" },
        { name: "⚡ Launch Both", value: "launch" },
        { name: "🧹 Clean All", value: "clean-all" },
        { name: "📦 Install All", value: "install-all" },
        { name: "🔧 Fix npm", value: "fix" },
        { name: "↩️  Back", value: "back" },
      ],
    },
  ]);

  // only run if not going back
  if (devChoice !== "back") {
    await safeRun(devChoice);
  }
}

// Main entry point
async function main() {
  // make sure dependencies exist before menus
  await ensureDependencies(); // auto install if missing

  let exit = false;
  while (!exit) {
    // main role selection
    const { mode } = await inquirer.prompt([
      {
        type: "list",
        name: "mode",
        message: "Choose your role:",
        choices: ["👤 User", "💻 Dev", "🚪 Exit"],
      },
    ]);

    if (mode.includes("User")) {
      await userMenu();
    } else if (mode.includes("Dev")) {
      await devMenu();
    } else if (mode.includes("Exit")) {
      exit = true;
      console.log("\n👋 Goodbye!\n");
    }
  }
}

main();
