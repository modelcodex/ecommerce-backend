import { Prisma } from "@prisma/client";
import type { ProductVariant } from "@prisma/client";


import { prisma } from "@/infrastructure/database/prisma/prisma.client.js";

// ====================
// VARIANT REPOSITORY
// ====================

class VariantRepository {

    // CREATE VARIANT
    async create(data: Prisma.ProductVariantCreateInput): Promise<ProductVariant> {
        return await prisma.productVariant.create({
            data,
        });
    }


    // FIND VARIANT BY ID

    async findById(id: string): Promise<ProductVariant | null> {
        return await prisma.productVariant.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });
    }


    // FIND VARIANT BY ID INCLUDING DELETED

    async findByIdIncludingDeleted(id: string): Promise<ProductVariant | null> {
        return await prisma.productVariant.findUnique({
            where: {
                id,
            },
        });
    }


    // FIND VARIANT BY SKU  

    async findBySku(sku: string): Promise<ProductVariant | null> {
        return await prisma.productVariant.findFirst({
            where: {
                sku,
                deletedAt: null,
            },
        });
    }


    // FIND VARIANT BY BARCODE   

    async findByBarcode(barcode: string): Promise<ProductVariant | null> {
        return await prisma.productVariant.findFirst({
            where: {
                barcode,
                deletedAt: null,
            },
        });
    }


    // FIND VARIANT BY PRODUCT AND SKU

    async findByProductAndSku(productId: string, sku: string): Promise<ProductVariant | null> {
        return await prisma.productVariant.findFirst({
            where: {
                productId,
                sku,
                deletedAt: null,
            },
        });
    }


    // FIND ALL VARIANTS

    async findAll(): Promise<ProductVariant[]> {
        return await prisma.productVariant.findMany({
            where: {
                deletedAt: null,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }


    // FIND VARIANTS BY PRODUCT

    async findByProduct(productId: string): Promise<ProductVariant[]> {
        return await prisma.productVariant.findMany({
            where: {
                productId,
                deletedAt: null,
            },
            orderBy: [
                { isDefault: "desc", },
                { createdAt: "asc", },
            ],
        });
    }


    // FIND ACTIVE VARIANTS

    async findAllActive(): Promise<ProductVariant[]> {
        return await prisma.productVariant.findMany({
            where: {
                isActive: true,
                deletedAt: null,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }


    // FIND ACTIVE VARIANTS BY PRODUCT

    async findActiveByProduct(productId: string): Promise<ProductVariant[]> {
        return await prisma.productVariant.findMany({
            where: {
                productId,
                isActive: true,
                deletedAt: null,
            },
            orderBy: [
                { isDefault: "desc", },
                { createdAt: "asc", },
            ],
        });
    }


    // FIND DEFAULT VARIANT

    async findDefaultByProduct(productId: string): Promise<ProductVariant | null> {
        return await prisma.productVariant.findFirst({
            where: {
                productId,
                isDefault: true,
                deletedAt: null,
            },
        });
    }


    // UPDATE VARIANT

    async update(id: string, data: Prisma.ProductVariantUpdateInput): Promise<ProductVariant> {
        return await prisma.productVariant.update({
            where: {
                id,
            },
            data,
        });
    }


    // SOFT DELETE VARIANT  

    async delete(id: string): Promise<ProductVariant> {
        return await prisma.productVariant.update({
            where: {
                id,
            },
            data: {
                deletedAt: new Date(),
                isActive: false,
                isDefault: false,
            },
        });
    }


    // RESTORE VARIANT

    async restore(id: string): Promise<ProductVariant> {
        return await prisma.productVariant.update({
            where: {
                id,
            },
            data: {
                deletedAt: null,
                isActive: true,
            },
        });
    }

    // COUNT VARIANTS

    async count(): Promise<number> {
        return await prisma.productVariant.count({
            where: {
                deletedAt: null,
            },
        });
    }


    // COUNT ACTIVE VARIANTS

    async countActive(): Promise<number> {
        return await prisma.productVariant.count({
            where: {
                isActive: true,
                deletedAt: null,
            },
        });
    }


    // COUNT VARIANTS BY PRODUCT

    async countByProduct(productId: string): Promise<number> {
        return await prisma.productVariant.count({
            where: {
                productId,
                deletedAt: null,
            },
        });
    }
}

export const variantRepository = new VariantRepository();