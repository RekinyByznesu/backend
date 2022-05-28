import type { PrismaClient, TagType, Tag } from "@prisma/client";
import { autoInjectable, inject } from "tsyringe";
import { BaseService } from "./BaseService";
import express from "express";

@autoInjectable()
export class TagService extends BaseService {
  constructor(
    @inject("APP") app: express.Application,
    @inject("PRISMA") prisma: PrismaClient
  ) {
    super(app, prisma);
  }

  public async addTag(
    userId: number,
    name: string,
    type?: TagType
  ): Promise<void> {
    if (await this.prisma.tag.findFirst({ where: { userId, name } })) {
      throw new Error("Tag already exists for this user");
    }
    await this.prisma.tag.create({ data: { name, userId, type } });
  }
  public async editTag(
    userId: number,
    id: number,
    data: {
      name?: string;
      type?: TagType;
    }
  ): Promise<void> {
    if (!(await this.prisma.tag.findFirst({ where: { id, userId } }))) {
      throw new Error(
        "This tag doesn't belong to the editing user or doesn't exist"
      );
    }
    await this.prisma.tag.update({ where: { id }, data });
  }
  public async getTagById(userId: number, id: number): Promise<Tag> {
    const tag = await this.prisma.tag.findFirst({ where: { id, userId } });
    if (!tag) {
      throw new Error("Tag doesn't exist on this user");
    }
    return tag;
  }
  public async getUserTags(userId: number): Promise<Tag[]> {
    return await this.prisma.tag.findMany({ where: { userId } });
  }
}
