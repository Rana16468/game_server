import { Server } from "http";
import app from "./app";
import config from "./app/config";
import { AppError } from "./app/middleware/golobalErrorHnadelar";
import httpStatus from "http-status";
import UserMonitoringServices from "./app/modules/monitoring/monitoring.services";

let server: Server;

async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  try {
    if (server) {
      server.close(() => {
        console.log("HTTP server closed");
      });
    }
    console.log("Running monitoring cleanup...");
    await UserMonitoringServices.cleanup().then(()=>{}).catch((error:any)=>{
      throw new AppError(
        httpStatus.SERVICE_UNAVAILABLE,
        "Error monitoring cleanup",
        error?.message
      );
    });
    console.log("Monitoring cleanup completed");
    process.exit(0);
  } catch (error: any) {
    if (error) {
      throw new AppError(
        httpStatus.SERVICE_UNAVAILABLE,
        "Error during cleanup",
        error?.message
      );
    }
    process.exit(1);
  }
}

async function main() {
  try {
    server = app.listen(config.port, () => {
      console.log(`Example app listening on port ${config.port}`);
    });

    // Handle graceful shutdown signals
    process.on("SIGTERM", () =>
      gracefulShutdown("SIGTERM")
        .then(() => {})
        .catch((error: any) => {
          throw new AppError(
            httpStatus.SERVICE_UNAVAILABLE,
            "graceful Shutdown SIGTERM Issues",
            error?.message
          );
        })
    );
    process.on("SIGINT", () =>
      gracefulShutdown("SIGINT")
        .then(() => {})
        .catch((error: any) => {
          throw new AppError(
            httpStatus.SERVICE_UNAVAILABLE,
            "graceful Shutdown SIGINT Issues",
            error?.message
          );
        })
    );

    process.on("unhandledRejection", (reason: any) => {
      if (reason) {
        gracefulShutdown("unhandledRejection")
          .then(() => {})
          .catch((error: any) => {
            throw new AppError(
              httpStatus.SERVICE_UNAVAILABLE,
              "unhandled Rejection Issues",
              error?.message
            );
          });
      }
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (error: any) => {
      if (error) {
        throw new AppError(
          httpStatus.SERVICE_UNAVAILABLE,
          "Uncaught Exception Issues",
          error?.message
        );
      }

      gracefulShutdown("uncaughtException").then(()=>{

      }).catch((error:any)=>{
        throw new AppError(
          httpStatus.SERVICE_UNAVAILABLE,
          "uncaught Exception Issues",
          error?.message
        );
      });
    });
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Server is Unavailable",
      error?.message
    );
  }
}

main()
  .then(() => {
    console.log("Rate My Plate Server is Running");
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
