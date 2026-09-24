import { ERROR_MESSAGES } from "@/shared/constants/error-messages.js";

export const BRAND_ERRORS = {
    INVALID_BRAND_NAME: "Invalid brand name.",
    INVALID_NAME_LIMIT: "Brand name must be within 2-50 characters.",
    INVALID_BRAND_SLUG: "Invalid brand slug.",
    INVALID_SLUG_LIMIT: "Brand slug must be within 2-50 characters.",
    INVALID_BRAND_DESCRIPTION: "Invalid brand description",
    INVALID_BRAND_LOGO_URL: "Invalid brand logo url",
    INVALID_BRAND_ID: ERROR_MESSAGES.INVALID_BRAND_ID,
    INVALID_PAGE_NUMBER: "Invalid page number",
    INVALID_BRAND_LIMIT: "Invalid page limit",
    INVALID_BRAND_SEARCH: "Invalid brand search",
    INVALID_BRAND_ACTIVE_STATUS: "Invalid brand active status",
    INVALID_BRAND_SORTBY: "Invalid brand sortby",
    INVALID_BRAND_ORDER: "Invalid brand order",

    BRAND_NAME_EXISTS: "Brand name exists.",
    BRAND_SLUG_EXISTS: "Brand slug exists",

    BRAND_NOT_FOUND: "Brand name not found",

    BRAND_HAS_PRODUCTS: "Brand has products."
} as const;