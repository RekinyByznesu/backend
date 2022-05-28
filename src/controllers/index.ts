import express from "express";
import { autoInjectable } from "tsyringe";
import { CategoriesController } from "./categories";
import { UsersController } from "./users";
import { TagsController } from "./tags";
import { EventsController } from "./events";
import { StatisticsController } from "./statistics";

@autoInjectable()
export class Controllers {
  constructor(
    private readonly usersController: UsersController,
    private readonly categoriesController: CategoriesController,
    private readonly tagsController: TagsController,
    private readonly eventsController: EventsController,
    private readonly statisticsController: StatisticsController
  ) {}
  getRouter(): express.Router {
    const router = express.Router();

    router.get("/", (req, res) => {
      res.json({
        message:
          "Welcome to the moodify API! We do not offer a public API at this moment, so there r no docs for u!",
      });
    });

    router.use("/users", this.usersController.getRoutes());
    router.use("/categories", this.categoriesController.getRoutes());
    router.use("/tags", this.tagsController.getRoutes());
    router.use("/events", this.eventsController.getRoutes());
    router.use("/statistics", this.statisticsController.getRoutes());

    return router;
  }
}
