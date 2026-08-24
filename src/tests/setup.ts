import { beforeAll, afterAll } from "vitest";
import { prisma } from "@/infrastructure/database/prisma/prisma.client.js";

// ==============================================
// This code is implemented via vitest.config.ts
// ==============================================

// vitest setup for db connection
beforeAll(async () => {
    await prisma.$connect();
});

// ===================
// AFTER ALL TEST DONE
// ===================

/**
 * Delete all test data and 
 * disconnect database.
 */

afterAll(async () => {


    // delete test product
    await prisma.product.deleteMany({
        where: {
            name: {
                startsWith: "test-"
            }
        }
    });

    // delete test user data
    await prisma.user.deleteMany({
        where: {
            email: {
                startsWith: "test-"
            },
        }
    });

    // delte test category
    await prisma.category.deleteMany({
        where: {
            name: {
                startsWith: "test-"
            }
        }
    });

    // delete test brand
    await prisma.brand.deleteMany({
        where: {
            name: {
                startsWith: "test-"
            }
        }
    });



    await prisma.$disconnect();
});
