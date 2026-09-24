import type { Request, Response, NextFunction } from "express";

import { variantService } from "./variant.service.js";
import { VARIANT_MESSAGES } from "./variant.constants.js";


class VariantController {

    // ================
    // CREATE VARIANT
    // ================

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = res.locals.body;
            const variant = await variantService.create(data);

            res.status(201).json({
                success: true,
                data: variant,
            });
        } catch (error) {
            next(error);
        }
    }

    // ===================
    // GET VARIANT BY ID
    // ===================

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = res.locals.params;
            const variant = await variantService.getById(id);

            res.status(200).json({
                success: true,
                data: variant,
            });
        } catch (error) {
            next(error);
        }
    }

    // ====================
    // GET VARIANT BY SKU
    // ====================

    async getBySku(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { sku } = res.locals.params;
            const variant = await variantService.getBySku(sku);

            res.status(200).json({
                success: true,
                data: variant,
            });
        } catch (error) {
            next(error);
        }
    }

    // ========================
    // GET VARIANT BY BARCODE
    // ========================

    async getByBarcode(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { barcode } = res.locals.params;
            const variant = await variantService.getByBarcode(barcode);

            res.status(200).json({
                success: true,
                data: variant,
            });
        } catch (error) {
            next(error);
        }
    }

    // ====================
    // GET ALL VARIANTS
    // ====================

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const variants = await variantService.getAll();

            res.status(200).json({
                success: true,
                data: variants,
            });
        } catch (error) {
            next(error);
        }
    }

    // =========================
    // GET VARIANTS BY PRODUCT
    // ==========================

    async getByProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { productId } = res.locals.params;
            const variants = await variantService.getByProduct(productId);

            res.status(200).json({
                success: true,
                data: variants,
            });
        } catch (error) {
            next(error);
        }
    }

    // ======================
    // GET ACTIVE VARIANTS
    // ======================

    async getActive(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const variants = await variantService.getActive();

            res.status(200).json({
                success: true,
                data: variants,
            });
        } catch (error) {
            next(error);
        }
    }

    // ===============================
    // GET ACTIVE VARIANTS BY PRODUCT
    // ===============================

    async getActiveByProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { productId } = res.locals.params;
            const variants = await variantService.getActiveByProduct(productId);

            res.status(200).json({
                success: true,
                data: variants,
            });
        } catch (error) {
            next(error);
        }
    }

    // ================================
    // GET DEFAULT VARIANT BY PRODUCT
    // ================================

    async getDefaultByProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { productId } = res.locals.params;

            const variant = await variantService.getDefaultByProduct(productId);

            res.status(200).json({
                success: true,
                data: variant,
            });
        } catch (error) {
            next(error);
        }
    }

    // =================
    // UPDATE VARIANT
    // =================

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = res.locals.params;
            const data = res.locals.body;
            const variant = await variantService.update(id, data);

            res.status(200).json({
                success: true,
                data: variant,
            });
        } catch (error) {
            next(error);
        }
    }

    // ===============
    // SET DEFAULT
    // ===============

    async setDefault(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = res.locals.params;
            const variant = await variantService.setDefault(id);

            res.status(200).json({
                success: true,
                data: variant,
            });
        } catch (error) {
            next(error);
        }
    }

    // ================
    // UNSET DEFAULT
    // ================

    async unsetDefault(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = res.locals.params;
            const variant = await variantService.unsetDefault(id);

            res.status(200).json({
                success: true,
                data: variant,
            });
        } catch (error) {
            next(error);
        }
    }

    // ============
    // ACTIVATE
    // ============

    async activate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = res.locals.params;
            const variant = await variantService.activate(id);

            res.status(200).json({
                success: true,
                data: variant,
            });
        } catch (error) {
            next(error);
        }
    }

    // =============
    // DEACTIVATE
    // =============

    async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = res.locals.params;
            const variant = await variantService.deactivate(id);

            res.status(200).json({
                success: true,
                data: variant,
            });
        } catch (error) {
            next(error);
        }
    }

    // ================
    // DELETE VARIANT
    // ================

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = res.locals.params;
            await variantService.delete(id);

            res.status(200).json({
                success: true,
                message: VARIANT_MESSAGES.PRODUCT_VARIANT_DELETED,
            });
        } catch (error) {
            next(error);
        }
    }

    // =================
    // RESTORE VARIANT
    // =================
    async restore(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = res.locals.params;
            const variant = await variantService.restore(id);

            res.status(200).json({
                success: true,
                data: variant,
            });
        } catch (error) {
            next(error);
        }
    }

    // ===============
    // COUNT VARIANTS
    // ===============

    async count(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const count = await variantService.count();

            res.status(200).json({
                success: true,
                data: count,
            });
        } catch (error) {
            next(error);
        }
    }

    // ========================
    // COUNT ACTIVE VARIANTS
    // ========================

    async countActive(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const count = await variantService.countActive();

            res.status(200).json({
                success: true,
                data: count,
            });
        } catch (error) {
            next(error);
        }
    }

    // ===========================
    // COUNT VARIANTS BY PRODUCT
    // ===========================

    async countByProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { productId } = res.locals.params;
            const count = await variantService.countByProduct(productId);

            res.status(200).json({
                success: true,
                data: count,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const variantController = new VariantController();