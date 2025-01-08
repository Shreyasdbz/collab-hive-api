import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import createError from 'http-errors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import type { TServerConfig } from './models/ts-server.model';
import requestLogger from './middlewares/logging.middleware';
import logger from './utils/logging.util';
import { apiRoutes } from './api';
import { prisma } from './config/database.config';

export class InitServer {
    server: Express;
    database: PrismaClient;

    constructor() {
        this.server = express();
        this.database = prisma;
    }

    setup(config: TServerConfig) {
        // Setup server configs
        this.server.set('host', config.host);
        this.server.set('port', config.port);
        // this.server.set('db_url', config.db_url);
        this.server.set('log_level', config.log_level);

        // Setup middlewares
        this.server.use(cors());
        this.server.use(helmet());
        this.server.use(requestLogger);
        // this.server.use(cookieParser());
        this.server.use(express.json());
        this.server.use(express.urlencoded({ extended: false }));

        // Setup routes
        this.server.use('/api', apiRoutes);

        // Create 404 error if requested route is not defined
        this.server.use((req: Request, res: Response, next: NextFunction) => {
            next(createError(404));
        });
    }

    async start() {
        const host = this.server.get('host');
        const port = this.server.get('port');

        try {
            // await this.database.connect(process.env.DB_URL!);
            this.server.listen(port, () =>
                logger.info(
                    `[server]: collab-hive-api server is running at ${host}:${port}`,
                ),
            );
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    }
}
