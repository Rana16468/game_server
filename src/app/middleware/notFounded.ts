import { NextFunction, Request, Response } from "express";

const notFounded = (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: false,
    message: "Api Not Founded",
    error: {
      path: req.originalUrl,
      message: "Your Requested path not founded",
    },
  });
  next();
};

export default notFounded;
