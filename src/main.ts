import { App } from "./app";
import { container } from "tsyringe";
import { Controllers } from "./controllers";
import express from "express";
import { PrismaClient } from "@prisma/client";

const port = process.env.PORT || 5000;

(async () => {
  const appInstance = new App();
  const app = appInstance.getApp();
  container.register<express.Application>("APP", { useValue: app });
  const prisma = new PrismaClient();
  container.register<PrismaClient>("PRISMA", { useValue: prisma });
  const controllers = container.resolve(Controllers);
  appInstance.attachControllers(controllers);
  app.listen(port, () => {
    console.log(`Listening: http://localhost:${port}`);
  });
})();
