import express from "express";
import type { PrismaClient } from "@prisma/client";

export abstract class BaseService {
  protected readonly app: express.Application;
  protected readonly prisma: PrismaClient;

  constructor(app: express.Application, prisma: PrismaClient) {
    this.app = app;
    this.prisma = prisma;
  }
}
