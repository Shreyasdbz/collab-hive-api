import dotenv from 'dotenv';
import env from 'env-var';
import type { TServerConfig } from '@models/ts-server.model';

dotenv.config();

export const configs: TServerConfig = {
    host: env.get('HOST').asString() || 'http://localhost',
    port: env.get('PORT').asInt() || 8080,
    log_level: env.get('LOG_LEVEL').asString() || 'tiny',
    db_url: env.get('DB_URL').asString() || '',
};
