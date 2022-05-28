import type { PrismaClient, EmotionType, Event } from "@prisma/client";
import { autoInjectable, inject } from "tsyringe";
import { BaseService } from "./BaseService";
import express from "express";

@autoInjectable()
export class EventService extends BaseService {
  constructor(
    @inject("APP") app: express.Application,
    @inject("PRISMA") prisma: PrismaClient
  ) {
    super(app, prisma);
  }

  public async create(
    userId: number,
    name: string,
    description: string,
    positive: boolean,
    emotions: Array<EmotionType>,
    date: number,
    categories: Array<number>,
    tags: Array<number>,
    solution?: string
  ): Promise<void> {
    await this.prisma.event.create({
      data: {
        userId,
        name,
        description,
        positive,
        emotions,
        date: new Date(date),
        solution,
        tags: {
          createMany: {
            data: tags.map((tagId) => {
              return { tagId };
            }),
          },
        },
        categories: {
          createMany: {
            data: categories.map((categoryId) => {
              return { categoryId };
            }),
          },
        },
      },
    });
  }

  public async getAll(
    userId: number,
    { date, positive }: { date?: number; positive?: boolean }
  ): Promise<Array<Event>> {
    let startOfDay;
    let endOfDay;
    if (date) {
      startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      endOfDay = new Date(startOfDay.getTime() + 86400000);
    }
    return await this.prisma.event.findMany({
      where: {
        userId,
        ...(date
          ? {
              date: {
                gte: startOfDay,
                lte: endOfDay,
              },
            }
          : {}),
        ...(positive ? { positive } : {}),
      },
      include: {
        tags: {
          select: {
            tag: true,
          },
        },
        categories: {
          select: {
            category: true,
          },
        },
      },
    });
  }

  public async getById(userId: number, id: number): Promise<Event> {
    const event = await this.prisma.event.findFirst({
      where: {
        userId,
        id,
      },
      include: {
        tags: {
          select: {
            tag: true,
          },
        },
        categories: {
          select: {
            category: true,
          },
        },
      },
    });
    if (!event) {
      throw Error("Event not found!");
    }
    return event;
  }

  public async getSuggestedSolution(
    userId: number,
    id: number
  ): Promise<Array<string> | null> {
    const event = await this.prisma.event.findFirst({
      where: {
        userId,
        id,
      },
    });
    if (!event) {
      throw Error("Event not found!");
    }

    const categories = await this.prisma.categoriesOnEvents.findMany({
      where: {
        eventId: id,
      },
      include: {
        category: true,
      },
    });

    const tags = await this.prisma.tagsOnEvents.findMany({
      where: {
        eventId: id,
      },
      include: {
        tag: true,
      },
    });

    const eventsWithSameCategories = await this.prisma.event.findMany({
      where: {
        userId,
        solution: { not: null },
        categories: {
          some: {
            categoryId: {
              in: categories.map((category) => category.category.id),
            },
          },
        },
      },
      include: {
        tags: {
          select: {
            tag: true,
          },
        },
      },
    });

    if (eventsWithSameCategories.length === 0) {
      return null;
    }

    const sortedEvents = eventsWithSameCategories.sort((a, b) => {
      const aTags = a.tags.map((tag) => tag.tag.id);
      const bTags = b.tags.map((tag) => tag.tag.id);
      const matchingTagsCountA = aTags.filter((tag) =>
        tags.map((tag) => tag.tag.id).includes(tag)
      ).length;
      const matchingTagsCountB = bTags.filter((tag) =>
        tags.map((tag) => tag.tag.id).includes(tag)
      ).length;
      const matchingEmotionsCountA = a.emotions.filter((emotion) =>
        event.emotions.includes(emotion)
      ).length;
      const matchingEmotionsCountB = b.emotions.filter((emotion) =>
        event.emotions.includes(emotion)
      ).length;

      return (
        matchingTagsCountA * 2 +
        matchingEmotionsCountA -
        (matchingTagsCountB * 2 + matchingEmotionsCountB)
      );
    });

    return sortedEvents
      .reverse()
      .slice(0, 3)
      .map((e) => e.solution!);

    // const eventsWithSameCategoriesAndTags = await this.prisma.event.findMany({
    //   where: {
    //     userId,
    //     categories: {
    //       some: {
    //         categoryId: {
    //           in: categories.map((category) => category.category.id),
    //         },
    //       },
    //     },
    //     tags: {
    //       some: {
    //         tagId: {
    //           in: tags.map((tag) => tag.tag.id),
    //         },
    //       },
    //     },
    //   },
    // });

    // console.log(eventsWithSameCategories);
    // console.log(eventsWithSameCategoriesAndTags);

    // if (eventsWithSameCategoriesAndTags.length === 0) {
    //   return eventsWithSameCategories.sort((a, b) => {

    //   })[0].solution;
    // }

    // return eventsWithSameCategoriesAndTags[0].solution;
  }

  public async update(
    userId: number,
    id: number,
    name?: string,
    description?: string,
    positive?: boolean,
    emotions?: Array<EmotionType>,
    date?: number,
    categories?: Array<number>,
    tags?: Array<number>,
    solution?: string
  ): Promise<void> {
    const event = await this.prisma.event.findFirst({
      where: {
        userId,
        id,
      },
    });
    if (!event) {
      throw Error("Event not found!");
    }

    await this.prisma.$transaction([
      ...(tags
        ? [this.prisma.tagsOnEvents.deleteMany({ where: { eventId: id } })]
        : []),
      ...(categories
        ? [
            this.prisma.categoriesOnEvents.deleteMany({
              where: { eventId: id },
            }),
          ]
        : []),
      this.prisma.event.update({
        where: {
          id,
        },
        data: {
          name,
          description,
          positive,
          emotions,
          ...(date ? { date: new Date(date) } : {}),
          solution,
          ...(tags
            ? {
                tags: {
                  createMany: {
                    data: tags.map((tagId) => {
                      return { tagId };
                    }),
                  },
                },
              }
            : {}),
          ...(categories
            ? {
                categories: {
                  createMany: {
                    data: categories.map((categoryId) => {
                      return { categoryId };
                    }),
                  },
                },
              }
            : {}),
        },
      }),
    ]);
  }

  public async delete(userId: number, id: number): Promise<void> {
    const event = await this.prisma.event.findFirst({
      where: {
        userId,
        id,
      },
    });
    if (!event) {
      throw Error("Event not found!");
    }

    await this.prisma.$transaction([
      this.prisma.tagsOnEvents.deleteMany({
        where: {
          eventId: id,
        },
      }),
      this.prisma.categoriesOnEvents.deleteMany({
        where: {
          eventId: id,
        },
      }),
      this.prisma.event.delete({
        where: {
          id,
        },
      }),
    ]);
  }
}
