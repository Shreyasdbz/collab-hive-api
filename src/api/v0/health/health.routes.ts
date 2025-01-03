import { Router } from "express";
import controller from "./health.controller";

const router = Router();

router.get("/", controller.getHealth);

export default router;
