import { autoInjectable } from "tsyringe";
import { UserService } from "../services/UserService";
import express from "express";
import Joi from "joi";

const registerOrLoginSchema = Joi.object({
  username: Joi.string().min(5).max(30).required(),
  password: Joi.string().min(8).max(500).required(),
});

@autoInjectable()
export class UsersController {
  constructor(private readonly userService: UserService) {}
  public getRoutes(): express.Router {
    const router = express.Router();
    router.post("/register", (req, res) => this.register(req, res));
    router.post("/login", (req, res) => this.login(req, res));
    return router;
  }

  private async register(req: express.Request, res: express.Response) {
    try {
      const body = await registerOrLoginSchema.validateAsync(req.body);
      await this.userService.register(body.username, body.password);
      res.sendStatus(201);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  private async login(req: express.Request, res: express.Response) {
    try {
      const body = await registerOrLoginSchema.validateAsync(req.body);
      const token = await this.userService.login(body.username, body.password);
      res.json({ token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
