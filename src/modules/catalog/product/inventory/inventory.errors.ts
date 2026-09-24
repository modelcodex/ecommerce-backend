export const INVENTORY_ERRORS = {
    INVENTORY_NOT_FOUND: "Inventory not found.",
    INVENTORY_ALREADY_EXISTS: "Inventory already exists for this product variant.",
    QUANTITY_INVALID: "Inventory quantity cannot be negative.",
    RESERVED_QUANTITY_INVALID: "Reserved quantity cannot be negative.",
    RESERVED_QUANTITY_EXCEEDS_STOCK: "Reserved quantity cannot exceed available stock.",
    INSUFFICIENT_STOCK: "Insufficient stock.",
    BACKORDER_NOT_ALLOWED: "Backorder is not allowed.",
    LOW_STOCK_ALERT_INVALID: "Low stock alert cannot be negative.",
} as const;