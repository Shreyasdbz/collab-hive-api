/**
 * Logger configuration (Pino)
 */
const loggingConfig = {
    level: process.env.LOG_LEVEL || "info",
    prettyPrint: process.env.NODE_ENV !== "production",
};

export default loggingConfig;
