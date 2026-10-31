import { Router } from "express";
import { cartController } from "../controllers/cart.controller.js";
import { validateBody, validateParams } from "@/shared/middlewares/validate-request.middleware.js";
import { optionalAuthenticate } from "@/modules/auth/middlewares/auth.middleware.js";
import { addCartItemSchema, updateCartItemSchema, cartItemIdParamsSchema } from "../validators/cart.validators.js";

// ==================
// CART ROUTES
// ==================

const router = Router();

// ==================
// OPTIONAL AUTHENTICATION
// ==================

router.use(optionalAuthenticate);


// ==================
// GET CART
// ==================

router.get("/",
    cartController.getCart,
);


// ==================
// ADD ITEM TO CART
// ==================

router.post("/items",
    validateBody(addCartItemSchema),
    cartController.addItem,
);


// ==============================
// UPDATE CART ITEM QUANTITY
// ==============================

router.patch("/items/:itemId",
    validateParams(cartItemIdParamsSchema),
    validateBody(updateCartItemSchema),
    cartController.updateItem,
);


// ==================
// REMOVE CART ITEM
// ==================

router.delete("/items/:itemId",
    validateParams(cartItemIdParamsSchema),
    cartController.removeItem,
);


// ==================
// CLEAR CART
// ==================

router.delete("/items",
    cartController.clearCart,
);


export const cartRouter = router;