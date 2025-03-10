import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { logger } from "./config/logger";
import router from "./routes";
import runMigrations from "./database/migrations/run";

// Inicializar o aplicativo Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Logging de requisições
app.use((req, res, next) => {
  logger.info(
    {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    },
    "Incoming request"
  );

  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(
      {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      },
      "Request completed"
    );
  });

  next();
});

// Rotas
app.use("/api", router);

// Rota de saúde
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Middleware de tratamento de erros
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error(
      { err, path: req.path, method: req.method },
      "Unhandled error"
    );

    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
);

// Iniciar o servidor
const startServer = async () => {
  try {
    // Executar migrações do banco de dados
    await runMigrations();

    // Iniciar o servidor
    const PORT = parseInt(env.PORT, 10);
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
      logger.info(`Health check available at http://localhost:${PORT}/health`);
      logger.info(`API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.fatal({ error }, "Failed to start server");
    process.exit(1);
  }
};

// Iniciar o servidor
startServer();
