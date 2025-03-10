import fs from "fs";
import path from "path";
import { dbAsync } from "../connection";
import { logger } from "../../config/logger";

async function runMigrations() {
  try {
    logger.info("Starting database migrations...");

    // Ler o arquivo de schema SQL
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Executar as migrações
    await dbAsync.exec(schema);

    logger.info("Database migrations completed successfully");
  } catch (error) {
    logger.error({ error }, "Failed to run database migrations");
    process.exit(1);
  }
}

// Executar migrações se este arquivo for executado diretamente
if (require.main === module) {
  runMigrations();
}

export default runMigrations;
