import { Router } from "express";

import { productController } from "../controllers/product.controller.js";
import { validateBody, validateParams, validateQuery, } from "@/shared/middlewares/validate-request.middleware.js";
import { brandIdSchema, productIdSchema, categoryIdSchema } from "@/shared/validators/common.validator.js";
import { createProductSchema, updateProductSchema, productQuerySchema, productSlugSchema } from "../validators/product.validator.js";

// =================
// PRODUCT ROUTER
// =================

const router = Router();

router.post("/",
    validateBody(createProductSchema),
    productController.create
);

router.get("/count", productController.count);
router.get("/count/active", productController.countActive);
router.get("/count/published", productController.countPublished);

router.get("/search",
    validateQuery(productQuerySchema),
    productController.search
);

router.get("/active", productController.getAllActive);
router.get("/published", productController.getAllPublished);
router.get("/featured", productController.getFeatured);

router.get("/category/:id",
    validateParams(categoryIdSchema),
    productController.getByCategory
);


router.get("/brand/:id",
    validateParams(brandIdSchema),
    productController.getByBrand
);


router.get("/slug/:slug",
    validateParams(productSlugSchema),
    productController.getBySlug
);

router.get("/", productController.getAll);

router.patch("/:id",
    validateParams(productIdSchema),
    validateBody(updateProductSchema),
    productController.update
);

router.delete("/:id",
    validateParams(productIdSchema),
    productController.delete
);

router.patch("/:id/restore",
    validateParams(productIdSchema),
    productController.restore
);

router.patch("/:id/publish",
    validateParams(productIdSchema),
    productController.publish
);

router.patch("/:id/unpublish",
    validateParams(productIdSchema),
    productController.unpublish
);

router.patch("/:id/activate",
    validateParams(productIdSchema),
    productController.activate
);

router.patch("/:id/deactivate",
    validateParams(productIdSchema),
    productController.deactivate
);

router.patch("/:id/feature",
    validateParams(productIdSchema),
    productController.feature
);

router.patch("/:id/unfeature",
    validateParams(productIdSchema),
    productController.unfeature
);

router.get("/:id",
    validateParams(productIdSchema),
    productController.getById
);

export const productRouter = router;