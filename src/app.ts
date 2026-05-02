import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import golobalErrorHnadelar, {
  AppError,
} from "./app/middleware/golobalErrorHnadelar";
import notFounded from "./app/middleware/notFounded";
import router from "./app/routes";
import cron from "node-cron";
import UnAuthUser from "./utility/Unauthorized/UnAuthUser";
import httpStatus from "http-status";
const app: Application = express();
//{origin:"https://pat-adoption-orpin.vercel.app",credentials:true}

app.use(cors());
// parser
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// corn function ----> started
cron.schedule(
  "0 0 * * *",
  () => {
    UnAuthUser().catch((error) => {
      throw new AppError(
        httpStatus.SERVICE_UNAVAILABLE,
        "cron issues app section",
        error
      );
    });
  },
  { scheduled: false }
);
app.get("/", (req: Request, res: Response) => {
  res.send({ message: " Rate My Plate Server is Running" });
});

app.use("/api/v1", router);
app.use(golobalErrorHnadelar);
app.use("*", notFounded);

export default app;
