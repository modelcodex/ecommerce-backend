import { BadRequestError, ConflictError, NotFoundError } from "@/shared/errors/index.js";

import { inventoryRepository } from "./inventory.repository.js";
import { INVENTORY_ERRORS } from "./inventory.errors.js";
import type {
    CreateInventoryDto,
    UpdateInventoryDto,
} from "./inventory.types.js";
import type { Inventory } from "@prisma/client";

// =========================
// INVENTORY SERVICE
// =========================

class InventoryService {

    // =================
    // CREATE INVENTORY
    // =================

    async create(data: CreateInventoryDto): Promise<Inventory> {

        // Check if inventory already exists
        const existingInventory =
            await inventoryRepository.findByVariantId(data.variantId);

        if (existingInventory) {
            throw new ConflictError(INVENTORY_ERRORS.INVENTORY_ALREADY_EXISTS);
        }

        // Validate reserved quantity against stock
        const quantity = data.quantity ?? 0;
        const reservedQuantity = data.reservedQuantity ?? 0;

        if (reservedQuantity > quantity) {
            throw new BadRequestError(INVENTORY_ERRORS.RESERVED_QUANTITY_EXCEEDS_STOCK);
        }

        return await inventoryRepository.create({
            variant: {
                connect: {
                    id: data.variantId,
                },
            },
            quantity,
            reservedQuantity,
            allowBackorder: data.allowBackorder ?? false,
            ...(data.lowStockAlert !== undefined && { lowStockAlert: data.lowStockAlert, }),
        });
    }

    // =================
    // GET BY ID
    // =================

    async getById(id: string): Promise<Inventory> {

        const inventory = await inventoryRepository.findById(id);

        if (!inventory) {
            throw new NotFoundError(INVENTORY_ERRORS.INVENTORY_NOT_FOUND);
        }

        return inventory;
    }

    // ==========================
    // GET BY VARIANT ID
    // ==========================

    async getByVariantId(variantId: string): Promise<Inventory> {

        const inventory = await inventoryRepository.findByVariantId(variantId);

        if (!inventory) {
            throw new NotFoundError(INVENTORY_ERRORS.INVENTORY_NOT_FOUND);
        }

        return inventory;
    }

    // =================
    // UPDATE
    // =================

    async update(id: string, data: UpdateInventoryDto): Promise<Inventory> {

        const inventory = await inventoryRepository.findById(id);

        if (!inventory) {
            throw new NotFoundError(INVENTORY_ERRORS.INVENTORY_NOT_FOUND);
        }

        // Determine final values after update
        const quantity = data.quantity ?? inventory.quantity;

        const reservedQuantity = data.reservedQuantity ?? inventory.reservedQuantity;

        // Validate reserved quantity against stock
        if (reservedQuantity > quantity) {
            throw new BadRequestError(INVENTORY_ERRORS.RESERVED_QUANTITY_EXCEEDS_STOCK);
        }

        return await inventoryRepository.update(id, {
            ...(data.quantity !== undefined && { quantity: data.quantity, }),
            ...(data.reservedQuantity !== undefined && { reservedQuantity: data.reservedQuantity, }),
            ...(data.allowBackorder !== undefined && { allowBackorder: data.allowBackorder, }),
            ...(data.lowStockAlert !== undefined && { lowStockAlert: data.lowStockAlert, }),
        });
    }

    // =================
    // DELETE
    // =================

    async delete(id: string): Promise<Inventory> {

        const inventory = await inventoryRepository.findById(id);

        if (!inventory) {
            throw new NotFoundError(INVENTORY_ERRORS.INVENTORY_NOT_FOUND);
        }

        return await inventoryRepository.delete(id);
    }
}

export const inventoryService = new InventoryService();