import type { Request, Response, NextFunction } from "express";

import { productService } from "../services/product.service.js";
import type { CreateProductDto, UpdateProductDto } from "../types/product.types.js";

import { PRODUCT_MESSAGES } from "../constants/product.constants.js";


class ProductController {
    // ================
    // CREATE PRODUCT
    // ================

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = res.locals.body as CreateProductDto;

            const product = await productService.create(data);

            res.status(201).json({
                success: true,
                message: PRODUCT_MESSAGES.PRODUCT_CREATED,
                data: product,
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================
    // GET PRODUCT BY ID
    // ==================

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = res.locals.params;

            const product = await productService.getById(id);

            res.status(200).json({
                success: true,
                data: product,
            });
        } catch (error) {
            next(error);
        }
    }

    // =====================
    // GET PRODUCT BY SLUG
    // =====================

    async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { slug } = res.locals.params;

            const product = await productService.getBySlug(slug);

            res.status(200).json({
                success: true,
                data: product,
            });
        } catch (error) {
            next(error);
        }
    }

    // ====================
    // GET ALL PRODUCTS
    // ====================

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const products = await productService.getAll();

            res.status(200).json({
                success: true,
                data: products,
            });
        } catch (error) {
            next(error);
        }
    }

    // ==========================
    // GET ALL ACTIVE PRODUCTS
    // ==========================
    async getAllActive(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const products =
                await productService.getAllActive();

            res.status(200).json({
                success: true,
                data: products,
            });
        } catch (error) {
            next(error);
        }
    }

    // ============================
    // GET ALL PUBLISHED PRODUCTS
    // ============================

    async getAllPublished(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const products =
                await productService.getAllPublished();

            res.status(200).json({
                success: true,
                data: products,
            });
        } catch (error) {
            next(error);
        }
    }

    // =======================
    // GET FEATURED PRODUCTS
    // =======================

    async getFeatured(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const products =
                await productService.getFeatured();

            res.status(200).json({
                success: true,
                data: products,
            });
        } catch (error) {
            next(error);
        }
    }

    // ==========================
    // GET PRODUCTS BY CATEGORY
    // ==========================

    async getByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = res.locals.params;

            const products = await productService.getByCategory(id);

            res.status(200).json({
                success: true,
                data: products,
            });
        } catch (error) {
            next(error);
        }
    }

    // ========================
    // GET PRODUCTS BY BRAND
    // ========================

    async getByBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = res.locals.params;

            const products =
                await productService.getByBrand(id);

            res.status(200).json({
                success: true,
                data: products,
            });
        } catch (error) {
            next(error);
        }
    }

    // ====================
    // SEARCH PRODUCTS
    // ====================

    async search(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const keyword = req.query.keyword as string;

            const products =
                await productService.search(keyword);

            res.status(200).json({
                success: true,
                data: products,
            });
        } catch (error) {
            next(error);
        }
    }

    // ===============
    // UPDATE PRODUCT
    // ===============

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = res.locals.params;

            const data = req.body as UpdateProductDto;

            const product =
                await productService.update(id, data);

            res.status(200).json({
                success: true,
                message: PRODUCT_MESSAGES.PRODUCT_UPDATED,
                data: product,
            });
        } catch (error) {
            next(error);
        }
    }

    // =================
    // DELETE PRODUCT
    // =================

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = res.locals.params;

            await productService.delete(id);

            res.status(200).json({
                success: true,
                message: PRODUCT_MESSAGES.PRODUCT_DELETED,
            });
        } catch (error) {
            next(error);
        }
    }

    // =================
    // RESTORE PRODUCT
    // =================

    async restore(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = res.locals.params;

            const product =
                await productService.restore(id);

            res.status(200).json({
                success: true,
                message: PRODUCT_MESSAGES.PRODUCT_RESTORED,
                data: product,
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================
    // PUBLISH PRODUCT
    // ==================

    async publish(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = res.locals.params;

            const product =
                await productService.publish(id);

            res.status(200).json({
                success: true,
                message: PRODUCT_MESSAGES.PRODUCT_PUBLISHED,
                data: product,
            });
        } catch (error) {
            next(error);
        }
    }

    // ====================
    // UNPUBLISH PRODUCT
    // ====================

    async unpublish(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = res.locals.params;

            const product =
                await productService.unpublish(id);

            res.status(200).json({
                success: true,
                message: PRODUCT_MESSAGES.PRODUCT_UNPUBLISHED,
                data: product,
            });
        } catch (error) {
            next(error);
        }
    }

    // =================
    // ACTIVATE PRODUCT
    // =================

    async activate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = res.locals.params;

            const product =
                await productService.activate(id);

            res.status(200).json({
                success: true,
                message: PRODUCT_MESSAGES.PRODUCT_ACTIVATED,
                data: product,
            });
        } catch (error) {
            next(error);
        }
    }

    // ====================
    // DEACTIVATE PRODUCT
    // ====================
    async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = res.locals.params;

            const product =
                await productService.deactivate(id);

            res.status(200).json({
                success: true,
                message: PRODUCT_MESSAGES.PRODUCT_DEACTIVATED,
                data: product,
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================
    // FEATURE PRODUCT
    // ==================
    async feature(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = res.locals.params;

            const product =
                await productService.feature(id);

            res.status(200).json({
                success: true,
                message: PRODUCT_MESSAGES.PRODUCT_FEATURED,
                data: product,
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================
    // UNFEATURE PRODUCT
    // ===================
    async unfeature(req: Request, res: Response, next: Function): Promise<void> {
        try {
            const { id } = res.locals.params;

            const product =
                await productService.unfeature(id);

            res.status(200).json({
                success: true,
                message: PRODUCT_MESSAGES.PRODUCT_UNFEATURED,
                data: product,
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================
    // COUNT PRODUCTS
    // ==================

    async count(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const count =
                await productService.count();

            res.status(200).json({
                success: true,
                data: {
                    count,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    // ======================
    // COUNT ACTIVE PRODUCTS
    // =======================

    async countActive(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const count =
                await productService.countActive();

            res.status(200).json({
                success: true,
                data: {
                    count,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    // ==========================
    // COUNT PUBLISHED PRODUCTS
    // ==========================
    async countPublished(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const count =
                await productService.countPublished();

            res.status(200).json({
                success: true,
                data: {
                    count,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}

export const productController = new ProductController();