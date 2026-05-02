import { Request } from "express";

const logError = (err: Error, req: Request) => {
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

export default logError;