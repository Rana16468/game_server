"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./app/config"));
const golobalErrorHnadelar_1 = require("./app/middleware/golobalErrorHnadelar");
const http_status_1 = __importDefault(require("http-status"));
const monitoring_services_1 = __importDefault(require("./app/modules/monitoring/monitoring.services"));
let server;
function gracefulShutdown(signal) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`\n${signal} received. Starting graceful shutdown...`);
        try {
            if (server) {
                server.close(() => {
                    console.log("HTTP server closed");
                });
            }
            console.log("Running monitoring cleanup...");
            yield monitoring_services_1.default.cleanup().then(() => { }).catch((error) => {
                throw new golobalErrorHnadelar_1.AppError(http_status_1.default.SERVICE_UNAVAILABLE, "Error monitoring cleanup", error === null || error === void 0 ? void 0 : error.message);
            });
            console.log("Monitoring cleanup completed");
            process.exit(0);
        }
        catch (error) {
            if (error) {
                throw new golobalErrorHnadelar_1.AppError(http_status_1.default.SERVICE_UNAVAILABLE, "Error during cleanup", error === null || error === void 0 ? void 0 : error.message);
            }
            process.exit(1);
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            server = app_1.default.listen(config_1.default.port, () => {
                console.log(`Example app listening on port ${config_1.default.port}`);
            });
            // Handle graceful shutdown signals
            process.on("SIGTERM", () => gracefulShutdown("SIGTERM")
                .then(() => { })
                .catch((error) => {
                throw new golobalErrorHnadelar_1.AppError(http_status_1.default.SERVICE_UNAVAILABLE, "graceful Shutdown SIGTERM Issues", error === null || error === void 0 ? void 0 : error.message);
            }));
            process.on("SIGINT", () => gracefulShutdown("SIGINT")
                .then(() => { })
                .catch((error) => {
                throw new golobalErrorHnadelar_1.AppError(http_status_1.default.SERVICE_UNAVAILABLE, "graceful Shutdown SIGINT Issues", error === null || error === void 0 ? void 0 : error.message);
            }));
            process.on("unhandledRejection", (reason) => {
                if (reason) {
                    gracefulShutdown("unhandledRejection")
                        .then(() => { })
                        .catch((error) => {
                        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.SERVICE_UNAVAILABLE, "unhandled Rejection Issues", error === null || error === void 0 ? void 0 : error.message);
                    });
                }
            });
            // Handle uncaught exceptions
            process.on("uncaughtException", (error) => {
                if (error) {
                    throw new golobalErrorHnadelar_1.AppError(http_status_1.default.SERVICE_UNAVAILABLE, "Uncaught Exception Issues", error === null || error === void 0 ? void 0 : error.message);
                }
                gracefulShutdown("uncaughtException").then(() => {
                }).catch((error) => {
                    throw new golobalErrorHnadelar_1.AppError(http_status_1.default.SERVICE_UNAVAILABLE, "uncaught Exception Issues", error === null || error === void 0 ? void 0 : error.message);
                });
            });
        }
        catch (error) {
            throw new golobalErrorHnadelar_1.AppError(http_status_1.default.SERVICE_UNAVAILABLE, "Server is Unavailable", error === null || error === void 0 ? void 0 : error.message);
        }
    });
}
main()
    .then(() => {
    console.log("Rate My Plate Server is Running");
})
    .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
