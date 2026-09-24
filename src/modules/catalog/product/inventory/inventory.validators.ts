import { z } from "zod";
import { INVENTORY_ERRORS } from "./inventory.errors.js";

// =========================
// INVENTORY ID
// =========================

export const inventoryIdSchema = z.object({
    id: z.string().regex(
        /^[a-z][a-z0-9]{23}$/,
        "Invalid inventory ID."
    ),
});

// =========================
// VARIANT ID
// =========================

export const inventoryVariantIdSchema = z.object({
    variantId: z.string().regex(
        /^[a-z][a-z0-9]{23}$/,
        "Invalid product variant ID."
    ),
});

// =========================
// CREATE INVENTORY
// =========================

export const createInventorySchema = z.object({
    variantId: z.string().regex(
        /^[a-z][a-z0-9]{23}$/,
        "Invalid product variant ID."
    ),

    quantity: z
        .number({ error: INVENTORY_ERRORS.QUANTITY_INVALID })
        .int()
        .nonnegative({ error: INVENTORY_ERRORS.QUANTITY_INVALID })
        .optional(),

    reservedQuantity: z
        .number({ error: INVENTORY_ERRORS.RESERVED_QUANTITY_INVALID })
        .int()
        .nonnegative({ error: INVENTORY_ERRORS.RESERVED_QUANTITY_INVALID })
        .optional(),

    allowBackorder: z
        .boolean()
        .optional(),

    lowStockAlert: z
        .number({ error: INVENTORY_ERRORS.LOW_STOCK_ALERT_INVALID })
        .int()
        .nonnegative({ error: INVENTORY_ERRORS.LOW_STOCK_ALERT_INVALID })
        .optional(),
});

// =========================
// UPDATE INVENTORY
// =========================

export const updateInventorySchema = z.object({
    quantity: z
        .number({ error: INVENTORY_ERRORS.QUANTITY_INVALID })
        .int()
        .nonnegative({ error: INVENTORY_ERRORS.QUANTITY_INVALID })
        .optional(),

    reservedQuantity: z
        .number({ error: INVENTORY_ERRORS.RESERVED_QUANTITY_INVALID })
        .int()
        .nonnegative({ error: INVENTORY_ERRORS.RESERVED_QUANTITY_INVALID })
        .optional(),

    allowBackorder: z
        .boolean()
        .optional(),

    lowStockAlert: z
        .number({ error: INVENTORY_ERRORS.LOW_STOCK_ALERT_INVALID })
        .int()
        .nonnegative({ error: INVENTORY_ERRORS.LOW_STOCK_ALERT_INVALID })
        .optional(),
});