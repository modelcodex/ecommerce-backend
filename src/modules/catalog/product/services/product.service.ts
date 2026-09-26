import { productRepository } from "../repositories/product.repository.js";
import { categoryRepository } from "../../category/repositories/category.repository.js";
import { brandRepository } from "../../brand/repositories/brand.repository.js";
import type { Product } from "@prisma/client";

import type { CreateProductDto, UpdateProductDto } from "../types/product.types.js";
import { ConflictError } from "@/shared/errors/conflict.error.js";
import { NotFoundError } from "@/shared/errors/not-found.error.js";
import { PRODUCT_ERRORS } from "../errors/product-errors.js";


// =================
// PRODUCT SERVICE
// =================

class ProductService {
    // =================
    // CREATE PRODUCT
    // ================

    async create(data: CreateProductDto): Promise<Product> {

        // CHECK PRODUCT NAME
        const existingName = await productRepository.findByName(
            data.name
        );

        if (existingName) {
            throw new ConflictError(PRODUCT_ERRORS.PRODUCT_NAME_EXISTS);
        }


        // CHECK PRODUCT SLUG
        const existingSlug = await productRepository.findBySlug(
            data.slug
        );

        if (existingSlug) {
            throw new ConflictError(PRODUCT_ERRORS.PRODUCT_SLUG_EXISTS);
        }

        // CHECK CATEGORY
        const category = await categoryRepository.findById(
            data.categoryId
        );

        if (!category) {
            throw new NotFoundError(PRODUCT_ERRORS.CATEGORY_NOT_FOUND);
        }

        // CHECK BRAND
        if (data.brandId) {
            const brand = await brandRepository.findById(
                data.brandId
            );

            if (!brand) {
                throw new NotFoundError(PRODUCT_ERRORS.BRAND_NOT_FOUND);
            }
        }


        // CREATE PRODUCT
        return await productRepository.create({
            name: data.name,
            slug: data.slug,
            shortDescription: data.shortDescription ?? null,
            description: data.description ?? null,
            category: {
                connect: {
                    id: data.categoryId,
                },
            },

            ...(data.brandId && {
                brand: {
                    connect: {
                        id: data.brandId,
                    },
                },
            }),

            isActive: data.isActive ?? true,
            isFeatured: data.isFeatured ?? false,
            isPublished: data.isPublished ?? true,
            sortOrder: data.sortOrder ?? 0,
            metaTitle: data.metaTitle ?? null,
            metaDescription: data.metaDescription ?? null,
        });
    }

    // ====================
    // GET PRODUCT BY ID
    // ====================

    async getById(id: string): Promise<Product> {
        const product = await productRepository.findById(id);

        if (!product) {
            throw new NotFoundError(PRODUCT_ERRORS.PRODUCT_NOT_FOUND);
        }

        return product;
    }

    // ======================
    // GET PRODUCT BY SLUG
    // ======================

    async getBySlug(slug: string): Promise<Product> {
        const product = await productRepository.findBySlug(slug);

        if (!product) {
            throw new NotFoundError(PRODUCT_ERRORS.PRODUCT_NOT_FOUND);
        }

        return product;
    }

    // ====================
    // GET ALL PRODUCTS
    // ====================

    async getAll(): Promise<Product[]> {
        return await productRepository.findAll();
    }

    // ======================
    // GET ACTIVE PRODUCTS
    // ======================

    async getAllActive(): Promise<Product[]> {
        return await productRepository.findAllActive();
    }

    // =========================
    // GET PUBLISHED PRODUCTS
    // =========================

    async getAllPublished(): Promise<Product[]> {
        return await productRepository.findAllPublished();
    }

    // =========================
    // GET FEATURED PRODUCTS
    // =========================

    async getFeatured(): Promise<Product[]> {
        return await productRepository.findFeatured();
    }

    // ===========================
    // GET PRODUCTS BY CATEGORY
    // ===========================

    async getByCategory(categoryId: string): Promise<Product[]> {
        const category = await categoryRepository.findById(categoryId);

        if (!category) {
            throw new NotFoundError(PRODUCT_ERRORS.CATEGORY_NOT_FOUND);
        }

        return await productRepository.findByCategory(categoryId);
    }

    // ==========================
    // GET PRODUCTS BY BRAND
    // ==========================

    async getByBrand(brandId: string): Promise<Product[]> {
        const brand = await brandRepository.findById(
            brandId
        );

        if (!brand) {
            throw new NotFoundError(PRODUCT_ERRORS.BRAND_NOT_FOUND);
        }

        return await productRepository.findByBrand(
            brandId
        );
    }

    // ==================
    // SEARCH PRODUCTS
    // ==================

    async search(keyword: string): Promise<Product[]> {
        return await productRepository.search(keyword);
    }

    // =================
    // UPDATE PRODUCT
    // =================

    async update(id: string, data: UpdateProductDto): Promise<Product> {

        // CHECK PRODUCT
        const product = await productRepository.findById(id);

        if (!product) {
            throw new NotFoundError(PRODUCT_ERRORS.PRODUCT_NOT_FOUND);
        }


        // CHECK NAME UNIQUENESS
        if (data.name !== undefined && data.name !== product.name) {
            const existingName = await productRepository.findByName(data.name);

            if (existingName && existingName.id !== id) {
                throw new ConflictError(PRODUCT_ERRORS.PRODUCT_NAME_EXISTS);
            }
        }

        // CHECK SLUG UNIQUENESS
        if (data.slug !== undefined && data.slug !== product.slug) {
            const existingSlug = await productRepository.findBySlug(data.slug);

            if (existingSlug && existingSlug.id !== id) {
                throw new ConflictError(PRODUCT_ERRORS.PRODUCT_SLUG_EXISTS);
            }
        }

        // CHECK CATEGORY
        if (data.categoryId !== undefined && data.categoryId !== product.categoryId) {
            const category =
                await categoryRepository.findById(
                    data.categoryId
                );

            if (!category) {
                throw new NotFoundError(PRODUCT_ERRORS.CATEGORY_NOT_FOUND);
            }
        }


        // CHECK BRAND  

        if (
            data.brandId !== undefined &&
            data.brandId !== product.brandId
        ) {
            if (data.brandId) {
                const brand =
                    await brandRepository.findById(
                        data.brandId
                    );

                if (!brand) {
                    throw new NotFoundError(PRODUCT_ERRORS.BRAND_NOT_FOUND);
                }
            }
        }

        // UPDATE PRODUCT

        return await productRepository.update(id, {
            ...(data.name !== undefined && { name: data.name, }),
            ...(data.slug !== undefined && { slug: data.slug, }),
            ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription, }),
            ...(data.description !== undefined && { description: data.description, }),
            ...(data.categoryId !== undefined && {
                category: {
                    connect: {
                        id: data.categoryId,
                    },
                },
            }),

            ...(data.brandId !== undefined && {
                brand: data.brandId
                    ? {
                        connect: {
                            id: data.brandId,
                        },
                    }
                    : {
                        disconnect: true,
                    },
            }),

            ...(data.isActive !== undefined && { isActive: data.isActive, }),
            ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured, }),
            ...(data.isPublished !== undefined && { isPublished: data.isPublished, }),
            ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder, }),
            ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle, }),
            ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription, }),
        });
    }

    // ================
    // DELETE PRODUCT
    // ================

    async delete(id: string): Promise<Product> {
        const product = await productRepository.findById(id);

        if (!product) {
            throw new NotFoundError(PRODUCT_ERRORS.PRODUCT_NOT_FOUND);
        }

        return await productRepository.delete(id);
    }

    // =================
    // RESTORE PRODUCT
    // =================

    async restore(id: string) {
        const product = await productRepository.findByIdIncludingDeleted(id);

        if (!product) {
            throw new NotFoundError(PRODUCT_ERRORS.PRODUCT_NOT_FOUND);
        }

        if (!product.deletedAt) {
            return product;
        }

        return await productRepository.restore(id);
    }

    // =================
    // PUBLISH PRODUCT
    // =================

    async publish(id: string): Promise<Product> {
        const product = await productRepository.findById(id);

        if (!product) {
            throw new NotFoundError(PRODUCT_ERRORS.PRODUCT_NOT_FOUND);
        }

        if (!product.isActive) {
            throw new ConflictError(PRODUCT_ERRORS.PRODUCT_INACTIVE);
        }

        if (product.isPublished) {
            return product;
        }

        return await productRepository.update(id, {
            isPublished: true,
        });
    }

    // ===================
    // UNPUBLISH PRODUCT
    // ===================

    async unpublish(id: string): Promise<Product> {
        const product = await productRepository.findById(id);

        if (!product) {
            throw new NotFoundError(PRODUCT_ERRORS.PRODUCT_NOT_FOUND);
        }

        if (!product.isPublished) {
            return product;
        }

        return await productRepository.update(id, {
            isPublished: false,
        });
    }

    // ==================
    // ACTIVATE PRODUCT
    // ==================

    async activate(id: string) {
        const product = await productRepository.findById(id);

        if (!product) {
            throw new NotFoundError(PRODUCT_ERRORS.PRODUCT_NOT_FOUND);
        }

        if (product.isActive) {
            return product;
        }

        return await productRepository.update(id, {
            isActive: true,
        });
    }

    // ===================
    // DEACTIVATE PRODUCT
    // ===================

    async deactivate(id: string): Promise<Product> {
        const product = await productRepository.findById(id);

        if (!product) {
            throw new NotFoundError(PRODUCT_ERRORS.PRODUCT_NOT_FOUND);
        }

        return await productRepository.update(id, {
            isActive: false,
        });
    }

    // ================
    // FEATURE PRODUCT
    // ================

    async feature(id: string): Promise<Product> {
        const product = await productRepository.findById(id);

        if (!product) {
            throw new NotFoundError(PRODUCT_ERRORS.PRODUCT_NOT_FOUND);
        }

        if (product.isFeatured) {
            return product;
        }

        return await productRepository.update(id, {
            isFeatured: true,
        });
    }

    // ==================
    // UNFEATURE PRODUCT
    // ==================

    async unfeature(id: string): Promise<Product> {
        const product = await productRepository.findById(id);

        if (!product) {
            throw new NotFoundError(PRODUCT_ERRORS.PRODUCT_NOT_FOUND);
        }

        if (!product.isFeatured) {
            return product;
        }

        return await productRepository.update(id, {
            isFeatured: false,
        });
    }

    // ===============
    // COUNT PRODUCTS
    // ===============

    async count(): Promise<number> {
        return await productRepository.count();
    }

    // ======================
    // COUNT ACTIVE PRODUCTS
    // ======================

    async countActive(): Promise<number> {
        return await productRepository.countActive();
    }

    // =========================
    // COUNT PUBLISHED PRODUCTS
    // =========================

    async countPublished(): Promise<number> {
        return await productRepository.countPublished();
    }
}

export const productService = new ProductService();