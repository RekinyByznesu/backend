import { autoInjectable } from "tsyringe";
import express from "express";
import Joi from "joi";
import { CategoryService } from "../services/CategoryService";
import { protectedRoute } from "../middlewares";

@autoInjectable()
export class CategoriesController {
  constructor(private readonly categoryService: CategoryService) {}
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
        name: Joi.string().min(5).max(30).required(),
      }).validateAsync(req.body);
      await this.categoryService.create(res.locals.userData.id, body.name);
      res.sendStatus(201);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  private async getAll(req: express.Request, res: express.Response) {
    try {
      const categories = await this.categoryService.getAll(
        res.locals.userData.id
      );
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  private async getById(req: express.Request, res: express.Response) {
    try {
      const { id } = req.params;
      const category = await this.categoryService.getById(
        res.locals.userData.id,
        parseInt(id)
      );
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  private async update(req: express.Request, res: express.Response) {
    try {
      const { id } = req.params;
      const body = await Joi.object({
        name: Joi.string().min(5).max(30).required(),
      }).validateAsync(req.body);
      await this.categoryService.update(
        res.locals.userData.id,
        parseInt(id),
        body.name
      );
      res.sendStatus(200);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
