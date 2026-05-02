import { Response } from "express";

const sendRespone = <T>(
  res: Response,
  jsonData: {
    status: number;
    success: boolean;
    message: string;
    meta?: {
      limit: number;
      page: number;
      total: number;
    };
    data: T | null | undefined;
  }
) => {
  res.status(jsonData.status).json({
    success: jsonData.success,
    message: jsonData.message,
    meta: jsonData.meta || null || undefined,
    data: jsonData.data || undefined || null,
  });
};

export default sendRespone;
