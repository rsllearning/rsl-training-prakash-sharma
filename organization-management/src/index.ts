import { SCENARIOS } from "./demo/scenarios";
import { color } from "./utils/logger";

/**
 * Entry point.
 *   node dist/src/index.js            → runs every scenario
 *   node dist/src/index.js <scenario> → runs one scenario (seed | create | read | update | delete | validate)
 */
function main(argv: readonly string[]): number {
  const requested = argv[0]?.toLowerCase() ?? "all";
  const names = Object.keys(SCENARIOS);

  if (requested === "help" || requested === "--help") {
    console.log(`Usage: npm start -- [${["all", ...names].join(" | ")}]`);
    return 0;
  }

  const toRun = requested === "all" ? names : [requested];
  for (const name of toRun) {
    const scenario = SCENARIOS[name];
    if (scenario === undefined) {
      console.error(color.red(`Unknown scenario '${name}'. Available: all, ${names.join(", ")}`));
      return 1;
    }
    scenario();
  }
  return 0;
}

process.exitCode = main(process.argv.slice(2));
