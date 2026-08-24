import { z } from "zod";
import { PRODUCT_ERRORS } from "../errors/product-errors.js";
import { ERROR_MESSAGES } from "@/shared/constants/error-messages.js";

// ============================
// CREATE PRODUCT SCHEMA
// ============================

export const createProductSchema = z.object({
    name: z
        .string({ error: PRODUCT_ERRORS.INVALID_PRODUCT_NAME })
        .trim()
        .min(5, { error: PRODUCT_ERRORS.INVALID_PRODUCT_NAME_LIMIT })
        .max(50, { error: PRODUCT_ERRORS.INVALID_PRODUCT_NAME_LIMIT }),

    slug: z
        .string({ error: PRODUCT_ERRORS.INVALID_PRODUCT_SLUG })
        .trim()
        .min(5, { error: PRODUCT_ERRORS.INVALID_PRODUCT_SLUG_LIMIT })
        .max(50, { error: PRODUCT_ERRORS.INVALID_PRODUCT_SLUG_LIMIT }),

    shortDescription: z
        .string({ error: PRODUCT_ERRORS.INVALID_SHORT_DESCRIPTION })
        .trim()
        .max(100, { error: PRODUCT_ERRORS.INVALID_SHORT_DESCRIPTION })
        .optional(),

    description: z
        .string({ error: PRODUCT_ERRORS.INVALID_PRODUCT_DESCRIPTION })
        .trim()
        .max(1000, { error: PRODUCT_ERRORS.INVALID_PRODUCT_DESCRIPTION_LIMIT })
        .optional(),

    categoryId: z
        .cuid2({ error: ERROR_MESSAGES.INVALID_CATEGORY_ID }),

    brandId: z
        .cuid2({ error: ERROR_MESSAGES.INVALID_BRAND_ID })
        .optional()
        .nullable(),

    isActive: z
        .boolean()
        .optional(),

    isFeatured: z
        .boolean()
        .optional(),

    isPublished: z
        .boolean()
        .optional(),

    sortOrder: z
        .number({ error: PRODUCT_ERRORS.INVALID_SORT_ORDER })
        .int({ error: PRODUCT_ERRORS.INVALID_SORT_ORDER })
        .min(0, { error: PRODUCT_ERRORS.INVALID_SORT_ORDER })
        .optional(),

    metaTitle: z
        .string({ error: PRODUCT_ERRORS.INVALID_META_TITLE })
        .trim()
        .max(100, { error: PRODUCT_ERRORS.INVALID_META_TITLE_LIMIT })
        .optional(),

    metaDescription: z
        .string({ error: PRODUCT_ERRORS.INVALID_META_TITLE })
        .trim()
        .max(500, { error: PRODUCT_ERRORS.INVALID_META_DESCRIPTION })
        .optional(),
});


// ============================
// UPDATE PRODUCT SCHEMA
// ============================

export const updateProductSchema = createProductSchema
    .partial()
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message: PRODUCT_ERRORS.NO_DATA_PROVIDED,
        }
    );


// ============================
// PRODUCT QUERY SCHEMA
// ============================

export const productQuerySchema = z.object({
    page: z
        .coerce
        .number()
        .int()
        .min(1)
        .default(1),

    limit: z
        .coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(20),

    search: z
        .string()
        .trim()
        .optional(),

    categoryId: z
        .cuid2({ error: ERROR_MESSAGES.INVALID_CATEGORY_ID })
        .optional(),

    brandId: z
        .cuid2({ error: ERROR_MESSAGES.INVALID_BRAND_ID })
        .optional(),

    isActive: z
        .enum(["true", "false"])
        .transform((value) => value === "true")
        .optional(),

    isFeatured: z
        .enum(["true", "false"])
        .transform((value) => value === "true")
        .optional(),

    isPublished: z
        .enum(["true", "false"])
        .transform((value) => value === "true")
        .optional(),

    sortBy: z
        .enum([
            "name",
            "createdAt",
            "updatedAt",
            "sortOrder",
        ])
        .default("createdAt"),

    order: z
        .enum(["asc", "desc"])
        .default("desc"),
});

export const productSlugSchema = z.object({
    slug: z
        .string({ error: ERROR_MESSAGES.INVALID_PRODUCT_SLUG, })
        .trim()
        .min(5, { error: ERROR_MESSAGES.INVALID_PRODUCT_SLUG, })
        .max(50, { error: ERROR_MESSAGES.INVALID_PRODUCT_SLUG, })
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { error: ERROR_MESSAGES.INVALID_PRODUCT_SLUG, }),
});