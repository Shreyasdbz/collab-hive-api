import { Router } from "express";
import healthRoutes from "./health/health.routes";

const router = Router();

router.use("/health", healthRoutes);

export default router;
