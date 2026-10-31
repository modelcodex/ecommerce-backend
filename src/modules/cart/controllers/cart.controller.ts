import type { Request, Response, NextFunction } from "express";
import { SUCCESS_MESSAGES } from "@/shared/constants/success-messages.js";
import type { AddCartItemInput, UpdateCartItemInput } from "../types/cart.types.js";
import { cartService } from "../services/cart.service.js";

// ============================
// GUEST CART COOKIE
// ============================

const GUEST_CART_COOKIE = "guestCartToken";

const GUEST_CART_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 10 * 24 * 60 * 60 * 1000,
    path: "/",
};

// ============================
// CART CONTROLLER
// ============================

class CartController {

    // ============================
    // SET GUEST CART COOKIE
    // ============================

    private setGuestCookie(res: Response, guestToken?: string): void {
        if (!guestToken) {
            return;
        }

        res.cookie(
            GUEST_CART_COOKIE,
            guestToken,
            GUEST_CART_COOKIE_OPTIONS
        );
    }

    // ============================
    // GET CART
    // ============================

    getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const guestToken = req.cookies?.[GUEST_CART_COOKIE];

            const result = await cartService.getCart(userId, guestToken);

            this.setGuestCookie(res, result?.guestToken);

            res.status(200).json({
                success: true,
                message: SUCCESS_MESSAGES.FETCHED,
                data: result?.cart,
            });
        } catch (error) {
            next(error);
        }
    }

    // ============================
    // ADD ITEM TO CART
    // ============================

    addItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const guestToken = req.cookies?.[GUEST_CART_COOKIE];

            const data = res.locals.body as AddCartItemInput;

            const result = await cartService.addItem(
                data,
                userId,
                guestToken
            );

            this.setGuestCookie(res, result.guestToken);

            res.status(200).json({
                success: true,
                message: SUCCESS_MESSAGES.CREATED,
                data: result.cart,
            });
        } catch (error) {
            next(error);
        }
    }

    // ============================
    // UPDATE CART ITEM QUANTITY
    // ============================

    async updateItem(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            const guestToken = req.cookies?.[GUEST_CART_COOKIE];

            const { itemId } = res.locals.params as { itemId: string };
            const data = res.locals.body as UpdateCartItemInput;

            const result = await cartService.updateItem(
                itemId,
                data,
                userId,
                guestToken
            );

            res.status(200).json({
                success: true,
                message: SUCCESS_MESSAGES.UPDATED,
                data: result.cart,
            });
        } catch (error) {
            next(error);
        }
    }

    // ============================
    // REMOVE ITEM FROM CART
    // ============================

    async removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            const guestToken = req.cookies?.[GUEST_CART_COOKIE];

            const { itemId } = res.locals.params as { itemId: string };

            const result = await cartService.removeItem(
                itemId,
                userId,
                guestToken
            );

            res.status(200).json({
                success: true,
                message: SUCCESS_MESSAGES.DELETED,
                data: result.cart,
            });
        } catch (error) {
            next(error);
        }
    }

    // ============================
    // CLEAR CART
    // ============================

    async clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            const guestToken = req.cookies?.[GUEST_CART_COOKIE];

            const result = await cartService.clearCart(
                userId,
                guestToken
            );

            res.status(200).json({
                success: true,
                message: SUCCESS_MESSAGES.DELETED,
                data: result.cart,
            });
        } catch (error) {

            next(error);
        }
    }
}

// ============================
// EXPORT CART CONTROLLER
// ============================

export const cartController = new CartController();