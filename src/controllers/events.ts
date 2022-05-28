import { autoInjectable } from "tsyringe";
import express from "express";
import Joi from "joi";
import { EventService } from "../services/EventService";
import { protectedRoute } from "../middlewares";
import { EmotionType } from "@prisma/client";

const getEventSchema = () => {
  return Joi.object({
    name: Joi.string().min(5).max(30).required(),
    description: Joi.string().min(5).max(1000).required(),
    positive: Joi.boolean().required(),
    emotions: Joi.array()
      .items(
        Joi.string().valid(
          ...Object.keys(EmotionType).map(
            (key) => EmotionType[key as keyof typeof EmotionType]
          )
        )
      )
      .required(),
    date: Joi.number().positive().less(new Date().getTime()).required(),
    solution: Joi.string().min(5).max(200).when("positive", {
      is: false,
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    }),
    tags: Joi.array().items(Joi.number()).required(),
    categories: Joi.array().items(Joi.number()).required(),
  });
};

const getEditEventSchema = () => {
  return Joi.object({
    name: Joi.string().min(5).max(30),
    description: Joi.string().min(5).max(1000),
    positive: Joi.boolean(),
    emotions: Joi.array().items(
      Joi.string().valid(
        ...Object.keys(EmotionType).map(
          (key) => EmotionType[key as keyof typeof EmotionType]
        )
      )
    ),
    date: Joi.number().positive().less(new Date().getTime()),
    solution: Joi.string().min(5).max(200).when("positive", {
      is: false,
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    }),
    tags: Joi.array().items(Joi.number()),
    categories: Joi.array().items(Joi.number()),
  });
};

@autoInjectable()
export class EventsController {
  constructor(private readonly eventService: EventService) {}
  public getRoutes(): express.Router {
    const router = express.Router();
    router.post("/", protectedRoute, (req, res) => this.create(req, res));
    router.get("/", protectedRoute, (req, res) => this.getAll(req, res));
    router.get("/:id", protectedRoute, (req, res) => this.getById(req, res));
    router.get("/:id/suggestedSolution", protectedRoute, (req, res) =>
      this.getSuggestedSolution(req, res)
    );
    router.put("/:id", protectedRoute, (req, res) => this.update(req, res));
    router.delete("/:id", protectedRoute, (req, res) => this.delete(req, res));
    return router;
  }

  private async create(req: express.Request, res: express.Response) {
    try {
      const {
        name,
        description,
        positive,
        emotions,
        date,
        solution,
        tags,
        categories,
      } = await getEventSchema().validateAsync(req.body);
      await this.eventService.create(
        res.locals.userData.id,
        name,
        description,
        positive,
        emotions,
        date,
        categories,
        tags,
        solution
      );
      res.sendStatus(201);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
  private async getAll(req: express.Request, res: express.Response) {
    try {
      const { positive, date } = await Joi.object({
        positive: Joi.string().valid("true", "false").optional(),
        date: Joi.string()
          .regex(/^[0-9]+$/)
          .optional(),
      }).validateAsync(req.query);
      res.status(200).json(
        await this.eventService.getAll(res.locals.userData.id, {
          positive: "true" === positive,
          date: parseInt(date),
        })
      );
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
  private async getById(req: express.Request, res: express.Response) {
    try {
      const { id } = await Joi.object({
        id: Joi.string()
          .regex(/^[0-9]+$/)
          .required(),
      }).validateAsync(req.params);
      res
        .status(200)
        .json(
          await this.eventService.getById(res.locals.userData.id, parseInt(id))
        );
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  private async getSuggestedSolution(
    req: express.Request,
    res: express.Response
  ) {
    try {
      const { id } = await Joi.object({
        id: Joi.string()
          .regex(/^[0-9]+$/)
          .required(),
      }).validateAsync(req.params);
      res.status(200).json({
        solutions: await this.eventService.getSuggestedSolution(
          res.locals.userData.id,
          parseInt(id)
        ),
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  private async update(req: express.Request, res: express.Response) {
    try {
      const { id } = await Joi.object({
        id: Joi.string()
          .regex(/^[0-9]+$/)
          .required(),
      }).validateAsync(req.params);
      const {
        name,
        description,
        positive,
        emotions,
        date,
        solution,
        tags,
        categories,
      } = await getEditEventSchema().validateAsync(req.body);
      await this.eventService.update(
        res.locals.userData.id,
        parseInt(id),
        name,
        description,
        positive,
        emotions,
        date,
        categories,
        tags,
        solution
      );
      res.sendStatus(200);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  private async delete(req: express.Request, res: express.Response) {
    try {
      const { id } = await Joi.object({
        id: Joi.string()
          .regex(/^[0-9]+$/)
          .required(),
      }).validateAsync(req.params);
      await this.eventService.delete(res.locals.userData.id, parseInt(id));
      res.sendStatus(200);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
