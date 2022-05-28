import { autoInjectable } from "tsyringe";
import express from "express";
import Joi from "joi";
import { TagService } from "../services/TagService";
import { protectedRoute } from "../middlewares";
import { TagType } from "@prisma/client";

@autoInjectable()
export class TagsController {
  constructor(private readonly tagService: TagService) {}
  public getRoutes(): express.Router {
    const router = express.Router();
    router.post("/", protectedRoute, (req, res) => this.create(req, res));
    router.get("/", protectedRoute, (req, res) => this.getAll(req, res));
    router.get("/:id", protectedRoute, (req, res) => this.getById(req, res));
    router.put("/:id", protectedRoute, (req, res) => this.update(req, res));
    return router;
  }
  private async create(req: express.Request, res: express.Response) {
    try {
      const body = await Joi.object({
        name: Joi.string().min(2).max(30).required(),
        type: Joi.string().valid(
          ...Object.keys(TagType).map(
            (key) => TagType[key as keyof typeof TagType]
          )
        ),
      }).validateAsync(req.body);
      await this.tagService.addTag(
        res.locals.userData.id,
        body.name,
        body.type
      );
      res.sendStatus(201);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
  private async getAll(req: express.Request, res: express.Response) {
    try {
      const tags = await this.tagService.getUserTags(res.locals.userData.id);
      res.json(tags);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
  private async getById(req: express.Request, res: express.Response) {
    try {
      const { id } = req.params;
      const tag = await this.tagService.getTagById(
        res.locals.userData.id,
        parseInt(id)
      );
      res.status(200).json(tag);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
  private async update(req: express.Request, res: express.Response) {
    try {
      const { id } = req.params;
      const body = await Joi.object({
        name: Joi.string().min(2).max(30),
        type: Joi.string().valid(
          ...Object.keys(TagType).map(
            (key) => TagType[key as keyof typeof TagType]
          )
        ),
      }).validateAsync(req.body);
      await this.tagService.editTag(res.locals.userData.id, parseInt(id), body);
      res.sendStatus(200);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
