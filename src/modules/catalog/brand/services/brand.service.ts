import { Prisma } from "@prisma/client";
import type { Brand } from "@prisma/client";
import { brandRepository } from "../repositories/brand.repository.js";
import type { BrandList, BrandQueryDto, CreateBrandDto, UpdateBrandDto } from "../types/brand.types.js";
import { ConflictError } from "@/shared/errors/conflict.error.js";
import { BRAND_ERRORS } from "../errors/brand-errors.js";
import { NotFoundError } from "@/shared/errors/not-found.error.js";
import { productRepository } from "../../product/repositories/product.repository.js";


class BrandService {

    // =====================
    // CREATE A BRAND
    // =====================

    async create(data: CreateBrandDto): Promise<Brand> {

        const brandNameExists = await brandRepository.findByName(data.name);
        if (brandNameExists) {
            throw new ConflictError(BRAND_ERRORS.BRAND_NAME_EXISTS);
        }

        const brandSlugExists = await brandRepository.findBySlug(data.slug);
        if (brandSlugExists) {
            throw new ConflictError(BRAND_ERRORS.BRAND_SLUG_EXISTS);
        }

        return brandRepository.create({
            name: data.name,
            slug: data.slug,
            ...(data.description !== undefined && { description: data.description }),
            ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
        });
    }

    // ================
    // FIND BRAND BY ID
    // ================

    async findById(id: string): Promise<Brand> {
        const brand = await brandRepository.findById(id);
        if (!brand) throw new NotFoundError(BRAND_ERRORS.BRAND_NOT_FOUND);
        return brand;
    }

    // ====================
    // FIND LIST OF BRANDS
    // ====================

    async findMany(query: BrandQueryDto): Promise<BrandList> {
        const {
            page = 1,
            limit = 10,
            search,
            isActive,
            sortBy = "createdAt",
            order = "desc",
        } = query;

        const where = {
            ...(search && {
                OR: [{
                    name: {
                        contains: search,
                        mode: Prisma.QueryMode.insensitive,
                    }
                }, {
                    description: {
                        contains: search,
                        mode: Prisma.QueryMode.insensitive,
                    }
                },],
            }),
            ...(isActive !== undefined && { isActive, })
        };

        const brands = await brandRepository.findMany({
            skip: (page - 1) * limit,
            take: limit,
            where: where,
            orderBy: { [sortBy]: order },
        });

        const total = await brandRepository.count({
            where: where,
        });

        const totalPages = Math.ceil(total / limit);

        return {
            data: brands,
            meta: {
                page,
                limit,
                total,
                totalPages,
                hasPreviousPage: page > 1,
                hasNextPage: page < totalPages,
                previousPage: page > 1 ? page - 1 : null,
                nextPage: page < totalPages ? page + 1 : null,
            }
        }
    }

    //==================
    // UPDATE A BRAND 
    // =================

    async update(id: string, data: UpdateBrandDto): Promise<Brand> {
        const brand = await brandRepository.findById(id);
        if (!brand) {
            throw new NotFoundError(BRAND_ERRORS.BRAND_NOT_FOUND);
        }

        if (data.name) {
            const existing = await brandRepository.findByName(data.name);
            if (existing && existing.id !== id) {
                throw new ConflictError(BRAND_ERRORS.BRAND_NAME_EXISTS);
            }
        }
        if (data.slug) {
            const existing = await brandRepository.findBySlug(data.slug);
            if (existing && existing.id !== id) {
                throw new ConflictError(BRAND_ERRORS.BRAND_SLUG_EXISTS);
            }
        }

        const updateData: Prisma.BrandUpdateInput = {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.slug !== undefined && { slug: data.slug }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
        }

        return brandRepository.update(id, updateData);

    }

    // ============================
    // DELETE A BRAND (SOFT DELETE)
    // ============================

    async delete(id: string): Promise<Brand> {
        const brand = await brandRepository.findById(id);
        if (!brand) {
            throw new NotFoundError(BRAND_ERRORS.BRAND_NOT_FOUND);
        }
        // WHEN PRODUCT REPOSITORY IS READY, COMPLETE THIS PART
        // note: this code is completed accordingly after the completion of product repository 
        const hasProducts = await productRepository.countByBrand(id);

        if (hasProducts > 0) {
            throw new ConflictError(BRAND_ERRORS.BRAND_HAS_PRODUCTS);
        }

        return await brandRepository.delete(id);
    }
}

export const brandService = new BrandService();