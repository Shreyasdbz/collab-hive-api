/**
 * Supabase database configuration
 */

import { Prisma, PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

declare global {
    // Prevent multiple instances of Prisma Client in development
    // eslint-disable-next-line no-var
    var prisma: PrismaClient<
        Prisma.PrismaClientOptions,
        "info" | "warn" | "error" | "query"
    >;
}

if (process.env.NODE_ENV === "production") {
    prisma = new PrismaClient({
        log: ["query", "info", "warn", "error"],
        // log: [
        //     { emit: "event", level: "query" },
        //     { emit: "event", level: "info" },
        //     { emit: "event", level: "warn" },
        //     { emit: "event", level: "error" },
        // ],
        errorFormat: "pretty",
    });
} else {
    if (!global.prisma) {
        global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
}

// prisma.$on("query", (e) => {
//     logger.info("Query: " + e.query);
//     logger.info("Duration: " + e.duration + "ms");
// });

// prisma.$on("beforeExit", async () => {
//     logger.info("Prisma Client is being disconnected");
// });

// prisma.$use(async (params: any, next: (params: any) => Promise<any>) => {
//     const startTime = Date.now();
//     const result = await next(params);
//     const elapsedTime = Date.now() - startTime;

//     logger.info(
//         `[Prisma Query] ${params.model}.${params.action} took ${elapsedTime}ms`
//     );
//     return result;
// });

export { prisma };
