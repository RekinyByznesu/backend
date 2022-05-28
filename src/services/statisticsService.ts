import { PrismaClient, TagType, Tag } from "@prisma/client";
import { autoInjectable, inject } from "tsyringe";
import { BaseService } from "./BaseService";
import express from "express";

@autoInjectable()
export class StatisticsService extends BaseService {
  constructor(
    @inject("APP") app: express.Application,
    @inject("PRISMA") prisma: PrismaClient
  ) {
    super(app, prisma);
  }
  public async getScoresOfTagType(
    userId: number,
    type: TagType
  ): Promise<Array<{ tag: Tag; score: number }>> {
    const tags = await this.prisma.tag.findMany({ where: { userId, type } });
    const scores = tags.map(async (tag) => {
      const events = await this.prisma.event.findMany({
        where: {
          userId,
          tags: { some: { tagId: { in: tag.id } } },
        },
      });
      let score = 0;
      let number = 0;
      events.forEach((event) => {
        if (event.positive === true) {
          score += 5;
        } else {
          score += 1;
        }
        number++;
      });
      score = number === 0 ? 0 : score / number;
      return { tag, score };
    });
    return await Promise.all(scores);
  }
  public async getScoreOfDay(
    userId: number,
    date: number
  ): Promise<{ score: number }> {
    date;
    let startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    let endOfDay = new Date(startOfDay.getTime() + 86400000);
    console.log(startOfDay.toString());
    console.log(endOfDay.toString());
    const events = await this.prisma.event.findMany({
      where: { userId, date: { gte: startOfDay, lte: endOfDay } },
    });
    let score = 0;
    events.forEach((event) => {
      if (event.positive === true) {
        score += 5;
      } else {
        score += 1;
      }
    });
    return { score };
  }
}
