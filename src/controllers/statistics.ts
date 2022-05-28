import { autoInjectable } from "tsyringe";
import express from "express";
import Joi from "joi";
import { StatisticsService } from "../services/StatisticsService";
import { protectedRoute } from "../middlewares";
import { TagType } from "@prisma/client";

@autoInjectable()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}
  public getRoutes(): express.Router {
    const router = express.Router();
    router.get("/", protectedRoute, (req, res) =>
      this.statsByTagType(req, res)
    );
    router.get("/day", protectedRoute, (req, res) => this.statsByDay(req, res));
    return router;
  }
  private async statsByTagType(req: express.Request, res: express.Response) {
    try {
      const { tagType } = await Joi.object({
        tagType: Joi.string().valid(
          ...Object.keys(TagType).map(
            (key) => TagType[key as keyof typeof TagType]
          )
        ),
      }).validateAsync(req.query);
      res
        .status(200)
        .json(
          await this.statisticsService.getScoresOfTagType(
            res.locals.userData.id,
            tagType
          )
        );
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
  private async statsByDay(req: express.Request, res: express.Response) {
    try {
      const { date } = await Joi.object({
        date: Joi.string().regex(/^[0-9]+$/),
      }).validateAsync(req.query);
      res
        .status(200)
        .json(
          this.statisticsService.getScoreOfDay(
            res.locals.userData.id,
            parseInt(date)
          )
        );
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
