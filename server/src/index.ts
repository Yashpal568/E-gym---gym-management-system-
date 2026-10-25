import { app } from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
async function main() {
  await connectDatabase();
  app.listen(env.PORT, () => console.log(`GymSphere API listening on port ${env.PORT}`));
}
main().catch((error) => { console.error("API startup failed", error); process.exit(1); });