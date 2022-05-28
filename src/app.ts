import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

import { notFound, errorHandler } from "./middlewares";
import { Controllers } from "./controllers";
import { rateLimit } from "./middlewares/rate-limit";
export class App {
  private app?: express.Application;
  getApp(): express.Application {
    this.app = express();

    this.app.use(morgan("dev"));
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(rateLimit);
    this.app.use(express.json());

    this.app.set("trust proxy", 1);

    return this.app;
  }
  attachControllers(controllers: Controllers): void {
    if (!this.app) {
      throw Error("You must get the App first!");
    }
    this.app.use("/api/v1", controllers.getRouter());
    this.app.use(notFound);
    this.app.use(errorHandler);
  }
}
