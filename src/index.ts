import { startServer } from "./server";

async function main() {
  await startServer();
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});