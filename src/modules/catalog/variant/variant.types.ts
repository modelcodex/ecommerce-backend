import { z } from "zod";

import { createVariantSchema, updateVariantSchema, } from "./variant.validators.js";



export type CreateVariantDto = z.infer<typeof createVariantSchema>;

export type UpdateVariantDto = z.infer<typeof updateVariantSchema>;