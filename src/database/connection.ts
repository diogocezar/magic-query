import sqlite3 from "sqlite3";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { promisify } from "util";

// Habilitar mensagens de debug se estiver em ambiente de desenvolvimento
if (env.NODE_ENV === "development") {
  sqlite3.verbose();
}

// Criar conexão com o banco de dados
const db = new sqlite3.Database(env.DATABASE_PATH, (err) => {
  if (err) {
    logger.error({ err }, "Failed to connect to SQLite database");
    process.exit(1);
  }
  logger.info(`Connected to SQLite database at ${env.DATABASE_PATH}`);
});

// Promisify para usar async/await com SQLite
export const dbAsync = {
  run: (sql: string, params: any = []): Promise<any> => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve(this);
      });
    });
  },
  get: (sql: string, params: any = []): Promise<any> => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },
  all: (sql: string, params: any = []): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },
  exec: (sql: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  },
};

// Exportar a conexão original também
export default db;
