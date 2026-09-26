import z from "zod";
import type { createProductSchema, productQuerySchema, updateProductSchema } from "../validators/product.validator.js";
import type { Product } from "@prisma/client";
import type { PaginationMeta } from "@/shared/types/api-response.types.js";

export type CreateProductDto = z.infer<typeof createProductSchema>;

export type UpdateProductDto = z.infer<typeof updateProductSchema>;

export type ProductQueryDto = z.infer<typeof productQuerySchema>;

export interface ProductList {
    data: Product[];
    meta: PaginationMeta;
};