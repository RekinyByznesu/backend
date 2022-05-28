import { PrismaClient, TagType } from "@prisma/client";
import { autoInjectable, inject } from "tsyringe";
import { BaseService } from "./BaseService";
import express from "express";
import argon2 from "argon2";
import { generateJwt } from "../utils/jwt";
import { categories, tags } from "../utils/defaults";

@autoInjectable()
export class UserService extends BaseService {
  constructor(
    @inject("APP") app: express.Application,
    @inject("PRISMA") prisma: PrismaClient
  ) {
    super(app, prisma);
  }

  private async hashPassword(passwordToHash: string) {
    return await argon2.hash(passwordToHash);
  }

  private async verifyPassword(hash: string, passwordToCheck: string) {
    return await argon2.verify(hash, passwordToCheck);
  }

  public async register(username: string, password: string): Promise<void> {
    const hashedPassword = await this.hashPassword(password);
    const userInDb = await this.prisma.user.findUnique({ where: { username } });
    if (userInDb) {
      throw Error("Username taken!");
    }
    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
    await this.populateDefaultCategories(user.id);
    await this.populateDefaultTags(user.id);
  }

  public async login(username: string, password: string): Promise<string> {
    const userInDb = await this.prisma.user.findUnique({ where: { username } });
    if (!userInDb) {
      throw Error("Invalid credentials!");
    }
    if (await this.verifyPassword(userInDb.password, password)) {
      return generateJwt({ id: userInDb.id, username: userInDb.username });
    } else {
      throw Error("Invalid credentials!");
    }
  }

  private async populateDefaultCategories(userId: number) {
    for (const category of categories) {
      await this.prisma.category.create({
        data: {
          userId,
          name: category,
        },
      });
    }
  }

  private async populateDefaultTags(userId: number) {
    for (const tag of tags) {
      await this.prisma.tag.create({
        data: {
          userId,
          type: tag.type,
          name: tag.name,
        },
      });
    }
  }
}
