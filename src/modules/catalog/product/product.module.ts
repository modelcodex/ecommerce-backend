import { Router } from "express";

import { productRouter } from "./routes/product.routes.js";
import { variantModule } from "./variant/variant.module.js";

const router = Router();


// Product Variant
router.use("/variants", variantModule.router);

// Product 
router.use("/", productRouter);

// appRouter is using "/products" for product module
export const productModule = {
    router,
};