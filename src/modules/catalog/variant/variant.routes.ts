import { Router } from "express";

import { variantController } from "./variant.controller.js";

import {
    createVariantSchema,
    updateVariantSchema,
    variantIdSchema,
    variantProductIdSchema,
    variantSkuSchema,
    variantBarcodeSchema,
} from "./variant.validators.js";

import { validateBody, validateParams } from "@/shared/middlewares/validate-request.middleware.js";


const router = Router();


router.post("/",
    validateBody(createVariantSchema),
    variantController.create
);

router.get("/", variantController.getAll);
router.get("/count", variantController.count);
router.get("/count/active", variantController.countActive);



router.get("/sku/:sku",
    validateParams(variantSkuSchema),
    variantController.getBySku
);

router.get("/barcode/:barcode",
    validateParams(variantBarcodeSchema),
    variantController.getByBarcode
);

router.get("/product/:productId",
    validateParams(variantProductIdSchema),
    variantController.getByProduct
);

router.get("/product/:productId/active",
    validateParams(variantProductIdSchema),
    variantController.getActiveByProduct
);

router.get("/product/:productId/default",
    validateParams(variantProductIdSchema),
    variantController.getDefaultByProduct
);

router.get("/product/:productId/count",
    validateParams(variantProductIdSchema),
    variantController.countByProduct
);

router.get("/active", variantController.getActive);

router.get("/:id",
    validateParams(variantIdSchema),
    variantController.getById
);

router.patch("/:id",
    validateParams(variantIdSchema),
    validateBody(updateVariantSchema),
    variantController.update
);


router.patch("/:id/default",
    validateParams(variantIdSchema),
    variantController.setDefault
);


router.patch("/:id/default/remove",
    validateParams(variantIdSchema),
    variantController.unsetDefault
);


router.patch("/:id/activate",
    validateParams(variantIdSchema),
    variantController.activate
);

router.patch("/:id/deactivate",
    validateParams(variantIdSchema),
    variantController.deactivate
);

router.patch("/:id/restore",
    validateParams(variantIdSchema),
    variantController.restore
);

router.delete("/:id",
    validateParams(variantIdSchema),
    variantController.delete
);

export const variantRouter = router;