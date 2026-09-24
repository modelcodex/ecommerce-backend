import type { Request, Response, NextFunction } from "express";

import { inventoryService } from "./inventory.service.js";
import { INVENTORY_MESSAGES } from "./inventory.constants.js";


class InventoryController {

    // ===================
    // CREATE INVENTORY
    // ===================

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = res.locals.body;
            const inventory = await inventoryService.create(data);

            res.status(201).json({
                success: true,
                data: inventory,
            });
        } catch (error) {
            next(error);
        }
    }

    // =======================
    // GET INVENTORY BY ID
    // =======================

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = res.locals.params;
            const inventory = await inventoryService.getById(id);

            res.status(200).json({
                success: true,
                data: inventory,
            });
        } catch (error) {
            next(error);
        }
    }

    // ============================
    // GET INVENTORY BY VARIANT ID
    // ============================

    async getByVariantId(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { variantId } = res.locals.params;
            const inventory = await inventoryService.getByVariantId(variantId);

            res.status(200).json({
                success: true,
                data: inventory,
            });
        } catch (error) {
            next(error);
        }
    }

    // =====================
    // UPDATE INVENTORY
    // =====================

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = res.locals.params;
            const data = res.locals.body;

            const inventory = await inventoryService.update(id, data);

            res.status(200).json({
                success: true,
                data: inventory,
            });
        } catch (error) {
            next(error);
        }
    }

    // =====================
    // DELETE INVENTORY
    // =====================

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = res.locals.params;

            await inventoryService.delete(id);

            res.status(200).json({
                success: true,
                message: INVENTORY_MESSAGES.INVENTORY_DELETED,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const inventoryController = new InventoryController();