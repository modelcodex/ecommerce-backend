import { z } from "zod";

import { ERROR_MESSAGES } from "@/shared/constants/error-messages.js";

// =======================
// PRODUCT VARIANT ID
// =======================

export const variantIdSchema = z.object({
    id: z
        .string({
            error: ERROR_MESSAGES.INVALID_VARIANT_ID,
        })
        .trim()
        .regex(/^[a-z][a-z0-9]{23}$/, {
            error: ERROR_MESSAGES.INVALID_VARIANT_ID,
        }),
});

// ============
// PRODUCT ID
// ============

export const variantProductIdSchema = z.object({
    productId: z
        .string({
            error: ERROR_MESSAGES.INVALID_PRODUCT_ID,
        })
        .trim()
        .regex(/^[a-z][a-z0-9]{23}$/, {
            error: ERROR_MESSAGES.INVALID_PRODUCT_ID,
        }),
});

// ================
// CREATE VARIANT
// ================
export const createVariantSchema = z.object({
    productId: z
        .string({
            error: ERROR_MESSAGES.INVALID_PRODUCT_ID,
        })
        .trim()
        .regex(/^[a-z][a-z0-9]{23}$/, {
            error: ERROR_MESSAGES.INVALID_PRODUCT_ID,
        }),

    sku: z
        .string({
            error: ERROR_MESSAGES.INVALID_VARIANT_SKU,
        })
        .trim()
        .min(1, {
            error: ERROR_MESSAGES.INVALID_VARIANT_SKU,
        })
        .max(100, {
            error: ERROR_MESSAGES.INVALID_VARIANT_SKU,
        }),

    barcode: z
        .string({
            error: ERROR_MESSAGES.INVALID_VARIANT_BARCODE,
        })
        .trim()
        .min(1, {
            error: ERROR_MESSAGES.INVALID_VARIANT_BARCODE,
        })
        .max(100, {
            error: ERROR_MESSAGES.INVALID_VARIANT_BARCODE,
        })
        .optional(),

    price: z
        .number({
            error: ERROR_MESSAGES.INVALID_VARIANT_PRICE,
        })
        .nonnegative({
            error: ERROR_MESSAGES.INVALID_VARIANT_PRICE,
        }),

    costPrice: z
        .number({
            error: ERROR_MESSAGES.INVALID_VARIANT_COST_PRICE,
        })
        .nonnegative({
            error: ERROR_MESSAGES.INVALID_VARIANT_COST_PRICE,
        })
        .optional(),

    isDefault: z
        .boolean({
            error: ERROR_MESSAGES.INVALID_VARIANT_DEFAULT,
        })
        .optional(),

    isActive: z
        .boolean({
            error: ERROR_MESSAGES.INVALID_VARIANT_ACTIVE,
        })
        .optional(),

    trackInventory: z
        .boolean({
            error: ERROR_MESSAGES.INVALID_TRACK_INVENTORY,
        })
        .optional(),

    weight: z
        .number({
            error: ERROR_MESSAGES.INVALID_VARIANT_WEIGHT,
        })
        .positive({
            error: ERROR_MESSAGES.INVALID_VARIANT_WEIGHT,
        })
        .optional(),

    length: z
        .number({
            error: ERROR_MESSAGES.INVALID_VARIANT_LENGTH,
        })
        .positive({
            error: ERROR_MESSAGES.INVALID_VARIANT_LENGTH,
        })
        .optional(),

    width: z
        .number({
            error: ERROR_MESSAGES.INVALID_VARIANT_WIDTH,
        })
        .positive({
            error: ERROR_MESSAGES.INVALID_VARIANT_WIDTH,
        })
        .optional(),

    height: z
        .number({
            error: ERROR_MESSAGES.INVALID_VARIANT_HEIGHT,
        })
        .positive({
            error: ERROR_MESSAGES.INVALID_VARIANT_HEIGHT,
        })
        .optional(),
});

// ===============
// UPDATE VARIANT
// ================

export const updateVariantSchema =
    createVariantSchema
        .omit({
            productId: true,
        })
        .partial();

// ============
// SKU
// ============

export const variantSkuSchema = z.object({
    sku: z
        .string({
            error: ERROR_MESSAGES.INVALID_VARIANT_SKU,
        })
        .trim()
        .min(1, {
            error: ERROR_MESSAGES.INVALID_VARIANT_SKU,
        })
        .max(100, {
            error: ERROR_MESSAGES.INVALID_VARIANT_SKU,
        }),
});

// =============
// BARCODE
// =============

export const variantBarcodeSchema = z.object({
    barcode: z
        .string({
            error: ERROR_MESSAGES.INVALID_VARIANT_BARCODE,
        })
        .trim()
        .min(1, {
            error: ERROR_MESSAGES.INVALID_VARIANT_BARCODE,
        })
        .max(100, {
            error: ERROR_MESSAGES.INVALID_VARIANT_BARCODE,
        }),
});