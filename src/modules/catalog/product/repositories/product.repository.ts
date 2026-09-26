import { Prisma } from "@prisma/client";
import type { Product } from "@prisma/client";
import { prisma } from "@/infrastructure/database/prisma/prisma.client.js";

// =======================
// PRODUCT REPOSITORY
// =======================

class ProductRepository {

    // CHECK EXISTING BRAND BY ID
    async existsBrandById(id: string): Promise<boolean> {
        const brand = await prisma.brand.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
            },
        });

        return brand !== null;
    };

    // ==================
    // CREATE
    // ==================

    async create(data: Prisma.ProductCreateInput): Promise<Product> {
        return await prisma.product.create({
            data,
        });
    }

    // =================
    // FIND BY ID
    // =================

    async findById(id: string): Promise<Product | null> {
        return await prisma.product.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });
    }

    // ===============================
    // FIND BY ID - INCLUDING DELETED
    // ===============================

    async findByIdIncludingDeleted(id: string): Promise<Product | null> {
        return await prisma.product.findUnique({
            where: {
                id,
            },
        });
    }

    // ==================
    // FIND BY SLUG
    // ==================

    async findBySlug(slug: string): Promise<Product | null> {
        return await prisma.product.findFirst({
            where: {
                slug,
                deletedAt: null,
            },
        });
    }

    // ==============
    // FIND BY NAME
    // ==============

    async findByName(name: string): Promise<Product | null> {
        return await prisma.product.findFirst({
            where: {
                name,
                deletedAt: null,
            },
        });
    }

    // ===========
    // UPDATE
    // ===========

    async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
        return await prisma.product.update({
            where: {
                id,
            },
            data,
        });
    }

    // ==============
    // SOFT DELETE
    // ==============

    async delete(id: string): Promise<Product> {
        return await prisma.product.update({
            where: {
                id,
            },
            data: {
                deletedAt: new Date(),
                isActive: false,
            },
        });
    }

    // ==========
    // RESTORE
    // ==========
    async restore(id: string): Promise<Product> {
        return await prisma.product.update({
            where: {
                id,
            },
            data: {
                deletedAt: null,
                isActive: true,
            },
        });
    }

    // ===========
    // FIND ALL
    // ===========

    async findAll(): Promise<Product[]> {
        return await prisma.product.findMany({
            where: {
                deletedAt: null,
            },
            orderBy: {
                sortOrder: "asc",
            },
        });
    }

    // =========================
    // FIND ALL ACTIVE PRODUCTS
    // =========================

    async findAllActive(): Promise<Product[]> {
        return await prisma.product.findMany({
            where: {
                isActive: true,
                deletedAt: null,
            },
            orderBy: {
                sortOrder: "asc",
            },
        });
    }

    // ============================
    // FIND ALL PUBLISHED PRODUCTS
    // ============================

    async findAllPublished(): Promise<Product[]> {
        return await prisma.product.findMany({
            where: {
                isActive: true,
                isPublished: true,
                deletedAt: null,
            },
            orderBy: {
                sortOrder: "asc",
            },
        });
    }

    // =======================
    // FIND FEATURED PRODUCTS
    // =======================

    async findFeatured(): Promise<Product[]> {
        return await prisma.product.findMany({
            where: {
                isActive: true,
                isPublished: true,
                isFeatured: true,
                deletedAt: null,
            },
            orderBy: {
                sortOrder: "asc",
            },
        });
    }

    // ===================
    // FIND BY CATEGORY
    // ===================

    async findByCategory(categoryId: string): Promise<Product[]> {
        return await prisma.product.findMany({
            where: {
                categoryId,
                deletedAt: null,
            },
            orderBy: {
                sortOrder: "asc",
            },
        });
    }

    // ===============
    // FIND BY BRAND
    // ===============

    async findByBrand(brandId: string): Promise<Product[]> {
        return await prisma.product.findMany({
            where: {
                brandId,
                deletedAt: null,
            },
            orderBy: {
                sortOrder: "asc",
            },
        });
    }

    // ===========================
    // FIND BY CATEGORY AND BRAND
    // ===========================

    async findByCategoryAndBrand(categoryId: string, brandId: string): Promise<Product[]> {
        return await prisma.product.findMany({
            where: {
                categoryId,
                brandId,
                deletedAt: null,
            },
            orderBy: {
                sortOrder: "asc",
            },
        });
    }

    // =================
    // SEARCH PRODUCTS
    // =================

    async search(keyword: string): Promise<Product[]> {
        return await prisma.product.findMany({
            where: {
                deletedAt: null,
                OR: [
                    {
                        name: {
                            contains: keyword,
                            mode: "insensitive",
                        },
                    },
                    {
                        slug: {
                            contains: keyword,
                            mode: "insensitive",
                        },
                    },
                    {
                        shortDescription: {
                            contains: keyword,
                            mode: "insensitive",
                        },
                    },
                    {
                        description: {
                            contains: keyword,
                            mode: "insensitive",
                        },
                    },
                ],
            },
            orderBy: {
                sortOrder: "asc",
            },
        });
    }

    // ====================
    // COUNT ALL PRODUCTS
    // ====================

    async count(): Promise<number> {
        return await prisma.product.count({
            where: {
                deletedAt: null,
            },
        });
    }

    // =======================
    // COUNT ACTIVE PRODUCTS
    // =======================

    async countActive(): Promise<number> {
        return await prisma.product.count({
            where: {
                isActive: true,
                deletedAt: null,
            },
        });
    }

    // =========================
    // COUNT PUBLISHED PRODUCTS
    // =========================

    async countPublished(): Promise<number> {
        return await prisma.product.count({
            where: {
                isActive: true,
                isPublished: true,
                deletedAt: null,
            },
        });
    }

    // ===================
    // COUNT BY CATEGORY
    // ===================

    async countByCategory(categoryId: string): Promise<number> {
        return await prisma.product.count({
            where: {
                categoryId,
                deletedAt: null,
            },
        });
    }

    // ================
    // COUNT BY BRAND
    // ================

    async countByBrand(brandId: string): Promise<number> {
        return await prisma.product.count({
            where: {
                brandId,
                deletedAt: null,
            },
        });
    }
}

export const productRepository = new ProductRepository();