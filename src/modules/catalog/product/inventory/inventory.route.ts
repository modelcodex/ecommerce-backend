import { Router } from "express";

import { inventoryController } from "./inventory.controller.js";

import {
    createInventorySchema,
    updateInventorySchema,
    inventoryIdSchema,
    inventoryVariantIdSchema,
} from "./inventory.validators.js";

import {
    validateBody,
    validateParams,
} from "@/shared/middlewares/validate-request.middleware.js";


const router = Router();


router.post("/",
    validateBody(createInventorySchema),
    inventoryController.create
);


router.get("/variant/:variantId",
    validateParams(inventoryVariantIdSchema),
    inventoryController.getByVariantId
);


router.get("/:id",
    validateParams(inventoryIdSchema),
    inventoryController.getById
);


router.patch("/:id",
    validateParams(inventoryIdSchema),
    validateBody(updateInventorySchema),
    inventoryController.update
);


router.delete("/:id",
    validateParams(inventoryIdSchema),
    inventoryController.delete
);


export const inventoryRouter = router;