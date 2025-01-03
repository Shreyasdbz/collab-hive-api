import { Request, Response, NextFunction } from "express";
import { HealthService } from "./health.service";

class HealthController {
    /**
     * [GET] /health
     * Returns the health status of the service
     * @param req
     * @param res
     * @param next
     */
    public async getHealth(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const healthService = new HealthService();
            const result = await healthService.checkHealth();
            res.send(result);
        } catch (error) {
            next(error);
        }
    }
}

export default new HealthController();
