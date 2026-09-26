import { Prisma } from "@prisma/client";
import type { ProductVariant } from "@prisma/client";
import { prisma } from "@/infrastructure/database/prisma/prisma.client.js";
import { NotFoundError } from "@/shared/errors/not-found.error.js";
import { ConflictError } from "@/shared/errors/conflict.error.js";
import { productRepository } from "../product/repositories/product.repository.js";
import { variantRepository } from "./variant.repository.js";
import type { CreateVariantDto, UpdateVariantDto, } from "./variant.types.js";
import { VARIANT_ERRORS } from "./variant.errors.js";

// ==================
// VARIANT SERVICE
// ==================

class VariantService {

    // CREATE VARIANT
    async create(
        data: CreateVariantDto
    ): Promise<ProductVariant> {

        // Check product
        const product = await productRepository.findById(data.productId);

        if (!product) {
            throw new NotFoundError(VARIANT_ERRORS.PRODUCT_NOT_FOUND);
        }

        // Check SKU
        const existingSku = await variantRepository.findBySku(data.sku);

        if (existingSku) {
            throw new ConflictError(VARIANT_ERRORS.SKU_EXISTS);
        }

        // variant input data
        const variantData: Prisma.ProductVariantCreateInput = {
            sku: data.sku,
            price: data.price,
            isDefault: data.isDefault ?? false,
            isActive: data.isActive ?? true,
            trackInventory: data.trackInventory ?? true,

            ...(data.barcode !== undefined && { barcode: data.barcode, }),
            ...(data.costPrice !== undefined && { costPrice: data.costPrice, }),
            ...(data.weight !== undefined && { weight: data.weight, }),
            ...(data.length !== undefined && { length: data.length, }),
            ...(data.width !== undefined && { width: data.width, }),
            ...(data.height !== undefined && { height: data.height, }),
            product: {
                connect: {
                    id: data.productId,
                },
            },
        };


        // Create default variant
        if (data.isDefault === true) {
            return await prisma.$transaction(
                async (tx) => {

                    await tx.productVariant.updateMany({
                        where: {
                            productId: data.productId,
                            isDefault: true,
                            deletedAt: null,
                        },
                        data: {
                            isDefault: false,
                        },
                    });

                    return await tx.productVariant.create({
                        data: variantData,
                    });
                }
            );
        }


        // Create normal variant 

        return await variantRepository.create(
            variantData
        );
    }

    // ==================
    // GET BY ID
    // ==================

    async getById(id: string): Promise<ProductVariant> {

        const variant = await variantRepository.findById(id);
        if (!variant) {
            throw new NotFoundError(VARIANT_ERRORS.VARIANT_NOT_FOUND);
        }

        return variant;
    }

    // =================
    // GET BY SKU
    // ==================
    async getBySku(sku: string): Promise<ProductVariant> {

        const variant = await variantRepository.findBySku(sku);
        if (!variant) {
            throw new NotFoundError(VARIANT_ERRORS.VARIANT_NOT_FOUND);
        }

        return variant;
    }

    // ===================
    // GET BY BARCODE
    // ===================

    async getByBarcode(barcode: string): Promise<ProductVariant> {

        const variant = await variantRepository.findByBarcode(barcode);

        if (!variant) {
            throw new NotFoundError(VARIANT_ERRORS.VARIANT_NOT_FOUND);
        }

        return variant;
    }

    // ================
    // GET ALL VARIANT
    // ================

    async getAll(): Promise<ProductVariant[]> {
        return await variantRepository.findAll();
    }

    // =================
    // GET BY PRODUCT
    // =================

    async getByProduct(productId: string): Promise<ProductVariant[]> {

        const product = await productRepository.findById(productId);

        if (!product) {
            throw new NotFoundError(VARIANT_ERRORS.PRODUCT_NOT_FOUND);
        }

        return await variantRepository.findByProduct(productId);
    }

    // =====================
    // GET ACTIVE VARIANT
    // =====================

    async getActive(): Promise<ProductVariant[]> {
        return await variantRepository.findAllActive();
    }

    // =======================
    // GET ACTIVE BY PRODUCT
    // =======================

    async getActiveByProduct(productId: string): Promise<ProductVariant[]> {

        const product = await productRepository.findById(productId);

        if (!product) {
            throw new NotFoundError(VARIANT_ERRORS.PRODUCT_NOT_FOUND);
        }

        return await variantRepository.findActiveByProduct(productId);
    }

    // ========================
    // GET DEFAULT BY PRODUCT
    // ========================

    async getDefaultByProduct(productId: string): Promise<ProductVariant> {

        const product = await productRepository.findById(productId);

        if (!product) {
            throw new NotFoundError(VARIANT_ERRORS.PRODUCT_NOT_FOUND);
        }

        const variant = await variantRepository.findDefaultByProduct(productId);

        if (!variant) {
            throw new NotFoundError(VARIANT_ERRORS.DEFAULT_VARIANT_NOT_FOUND);
        }

        return variant;
    }

    // ==================
    // UPDATE VARIANT
    // ==================

    async update(id: string, data: UpdateVariantDto): Promise<ProductVariant> {

        const variant = await variantRepository.findById(id);
        if (!variant) {
            throw new NotFoundError(VARIANT_ERRORS.VARIANT_NOT_FOUND);
        }

        if (data.sku !== undefined && data.sku !== variant.sku) {
            const existingSku = await variantRepository.findBySku(data.sku);

            if (existingSku && existingSku.id !== id) {
                throw new ConflictError(VARIANT_ERRORS.SKU_EXISTS);
            }
        }


        const updateData: Prisma.ProductVariantUpdateInput = {
            ...(data.sku !== undefined && { sku: data.sku, }),
            ...(data.barcode !== undefined && { barcode: data.barcode, }),
            ...(data.price !== undefined && { price: data.price, }),
            ...(data.costPrice !== undefined && { costPrice: data.costPrice, }),
            ...(data.isActive !== undefined && { isActive: data.isActive, }),
            ...(data.trackInventory !== undefined && { trackInventory: data.trackInventory, }),
            ...(data.weight !== undefined && { weight: data.weight, }),
            ...(data.length !== undefined && { length: data.length, }),
            ...(data.width !== undefined && { width: data.width, }),
            ...(data.height !== undefined && { height: data.height, }),
        };

        // SET DEFAULT

        if (data.isDefault === true) {
            return await prisma.$transaction(
                async (tx) => {
                    await tx.productVariant.updateMany({
                        where: {
                            productId: variant.productId,
                            id: {
                                not: id,
                            },
                            isDefault: true,
                            deletedAt: null,
                        },
                        data: {
                            isDefault: false,
                        },
                    });

                    // Update with data
                    return await tx.productVariant.update({
                        where: {
                            id,
                        },
                        data: {
                            ...updateData,
                            isDefault: true,
                        },
                    });
                }
            );
        }


        // UNSET DEFAULT

        if (data.isDefault === false) {
            updateData.isDefault = false;
        }

        // DATA UPDATE
        return await variantRepository.update(
            id,
            updateData
        );
    }


    // SET DEFAULT VARIANT

    async setDefault(id: string): Promise<ProductVariant> {

        const variant = await variantRepository.findById(id);
        if (!variant) {
            throw new NotFoundError(VARIANT_ERRORS.VARIANT_NOT_FOUND);
        }

        if (!variant.isActive) {
            throw new ConflictError(VARIANT_ERRORS.VARIANT_INACTIVE);
        }

        return await prisma.$transaction(
            async (tx) => {

                await tx.productVariant.updateMany({
                    where: {
                        productId: variant.productId,
                        id: {
                            not: id,
                        },
                        isDefault: true,
                        deletedAt: null,
                    },
                    data: {
                        isDefault: false,
                    },
                });

                return await tx.productVariant.update({
                    where: {
                        id,
                    },
                    data: {
                        isDefault: true,
                    },
                });
            }
        );
    }


    // UNSET DEFAULT VARIANT   

    async unsetDefault(
        id: string
    ): Promise<ProductVariant> {

        const variant =
            await variantRepository.findById(id);

        if (!variant) {
            throw new NotFoundError(VARIANT_ERRORS.VARIANT_NOT_FOUND);
        }

        return await variantRepository.update(
            id,
            {
                isDefault: false,
            }
        );
    }


    // ACTIVATE

    async activate(id: string): Promise<ProductVariant> {

        const variant = await variantRepository.findById(id);

        if (!variant) {
            throw new NotFoundError(VARIANT_ERRORS.VARIANT_NOT_FOUND);
        }

        return await variantRepository.update(
            id,
            {
                isActive: true,
            }
        );
    }


    // DEACTIVATE VARIANT

    async deactivate(id: string): Promise<ProductVariant> {

        const variant = await variantRepository.findById(id);

        if (!variant) {
            throw new NotFoundError(VARIANT_ERRORS.VARIANT_NOT_FOUND);
        }

        return await variantRepository.update(
            id,
            {
                isActive: false,
                isDefault: false,
            }
        );
    }


    // DELETE VARIANT

    async delete(id: string): Promise<ProductVariant> {

        const variant = await variantRepository.findById(id);

        if (!variant) {
            throw new NotFoundError(VARIANT_ERRORS.VARIANT_NOT_FOUND);
        }
        return await variantRepository.delete(id);
    }


    // RESTORE

    async restore(id: string): Promise<ProductVariant> {

        const variant = await variantRepository.findByIdIncludingDeleted(id);

        if (!variant) {
            throw new NotFoundError(VARIANT_ERRORS.VARIANT_NOT_FOUND);
        }

        if (!variant.deletedAt) {
            throw new ConflictError(VARIANT_ERRORS.VARIANT_NOT_DELETED);
        }

        return await variantRepository.restore(id);
    }


    // COUNT

    async count(): Promise<number> {
        return await variantRepository.count();
    }


    // COUNT ACTIVE

    async countActive(): Promise<number> {
        return await variantRepository.countActive();
    }

    // COUNT BY PRODUCT

    async countByProduct(productId: string): Promise<number> {

        const product = await productRepository.findById(productId);

        if (!product) {
            throw new NotFoundError(VARIANT_ERRORS.PRODUCT_NOT_FOUND);
        }

        return await variantRepository.countByProduct(productId);
    }
}

export const variantService = new VariantService();