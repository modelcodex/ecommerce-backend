import type { Inventory } from "@prisma/client";

// =========================
// INVENTORY TYPES
// =========================

export type InventoryResponse = Inventory;

export interface CreateInventoryDto {
    variantId: string;
    quantity?: number;
    reservedQuantity?: number;
    allowBackorder?: boolean;
    lowStockAlert?: number;
}

export interface UpdateInventoryDto {
    quantity?: number;
    reservedQuantity?: number;
    allowBackorder?: boolean;
    lowStockAlert?: number;
}