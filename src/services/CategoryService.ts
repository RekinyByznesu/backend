import { autoInjectable, inject } from "tsyringe";
import express from "express";
import { BaseService } from "./BaseService";
import { Category, PrismaClient } from "@prisma/client";

@autoInjectable()
export class CategoryService extends BaseService {
  constructor(
    @inject("APP") app: express.Application,
    @inject("PRISMA") prisma: PrismaClient
  ) {
    super(app, prisma);
  }

  public async create(userId: number, name: string): Promise<void> {
    const categoryInDb = await this.prisma.category.findFirst({
      where: {
        name,
        userId,
      },
    });
    if (categoryInDb) {
      throw Error("The user already has a category with the given name!");
    }
    await this.prisma.category.create({
      data: {
        userId,
        name,
      },
    });
  }

  public async getAll(userId: number): Promise<Array<Category>> {
    return await this.prisma.category.findMany({
      where: {
        userId,
      },
    });
  }

  public async getById(userId: number, id: number): Promise<Category> {
    const category = await this.prisma.category.findFirst({
      where: {
        userId,
        id,
      },
    });
    if (!category) {
      throw Error("Category not found!");
    }
    return category;
  }

  public async update(userId: number, id: number, name: string): Promise<void> {
    const category = await this.prisma.category.findFirst({
      where: {
        userId,
        id,
      },
    });
    if (!category) {
      throw Error("Category not found!");
    }
    await this.prisma.category.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });
  }
}
