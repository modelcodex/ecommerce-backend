import { Prisma } from "@prisma/client";
import type { Inventory } from "@prisma/client";

import { prisma } from "@/infrastructure/database/prisma/prisma.client.js";

// =========================
// INVENTORY REPOSITORY
// =========================

class InventoryRepository {

    // ==================
    // CREATE
    // ==================

    async create(data: Prisma.InventoryCreateInput): Promise<Inventory> {
        return await prisma.inventory.create({
            data,
        });
    }

    // =================
    // FIND BY ID
    // =================

    async findById(id: string): Promise<Inventory | null> {
        return await prisma.inventory.findUnique({
            where: {
                id,
            },
        });
    }

    // ==========================
    // FIND BY VARIANT ID
    // ==========================

    async findByVariantId(variantId: string): Promise<Inventory | null> {
        return await prisma.inventory.findUnique({
            where: {
                variantId,
            },
        });
    }

    // =================
    // UPDATE
    // =================

    async update(id: string, data: Prisma.InventoryUpdateInput): Promise<Inventory> {
        return await prisma.inventory.update({
            where: {
                id,
            },
            data,
        });
    }

    // =================
    // DELETE
    // =================

    async delete(id: string): Promise<Inventory> {
        return await prisma.inventory.delete({
            where: {
                id,
            },
        });
    }
}

export const inventoryRepository = new InventoryRepository();