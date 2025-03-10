import { dbAsync } from "../connection";
import { logger } from "../../config/logger";
import { drivers, devices, positions } from "./data";
import runMigrations from "../migrations/run";

async function runSeeds() {
  try {
    logger.info("Starting database seeding...");

    // Executar migrações primeiro para garantir que as tabelas existam
    await runMigrations();

    // Limpar tabelas existentes (em ordem reversa devido às chaves estrangeiras)
    await dbAsync.exec("DELETE FROM positions");
    await dbAsync.exec("DELETE FROM devices");
    await dbAsync.exec("DELETE FROM drivers");

    // Resetar os contadores de autoincrement
    await dbAsync.exec(
      'DELETE FROM sqlite_sequence WHERE name IN ("drivers", "devices", "positions")'
    );

    logger.info("Inserting drivers...");
    for (const driver of drivers) {
      await dbAsync.run("INSERT INTO drivers (name) VALUES (?)", driver.name);
    }

    logger.info("Inserting devices...");
    for (const device of devices) {
      await dbAsync.run(
        "INSERT INTO devices (identifier, model, vehicle_plate, driver_id) VALUES (?, ?, ?, ?)",
        [
          device.identifier,
          device.model,
          device.vehicle_plate,
          device.driver_id,
        ]
      );
    }

    logger.info("Inserting positions...");
    for (const position of positions) {
      await dbAsync.run(
        "INSERT INTO positions (device_id, latitude, longitude, speed, direction, collected_at) VALUES (?, ?, ?, ?, ?, ?)",
        [
          position.device_id,
          position.latitude,
          position.longitude,
          position.speed,
          position.direction,
          position.collected_at,
        ]
      );
    }

    logger.info("Database seeding completed successfully");
  } catch (error) {
    logger.error({ error }, "Failed to run database seeds");
    process.exit(1);
  }
}

// Executar seeds se este arquivo for executado diretamente
if (require.main === module) {
  runSeeds();
}

export default runSeeds;
