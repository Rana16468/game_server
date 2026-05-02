"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logError = (err, req) => {
    console.error({
        timestamp: new Date().toISOString(),
        error: {
            name: err.name,
            message: err.message,
            stack: err.stack
        },
        request: {
            method: req.method,
            url: req.url,
            headers: req.headers,
            body: req.body
        }
    });
};
exports.default = logError;
