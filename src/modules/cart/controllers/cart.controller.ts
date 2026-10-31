import type { Request, Response, NextFunction } from "express";

import { SUCCESS_MESSAGES } from "@/shared/constants/success-messages.js";

import { cartService } from "../services/cart.service.js";

// ============================
// CART CONTROLLER
// ============================

class CartController {

    // ============================
    // GET CART
    // ============================

    async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.userId as string;

            const cart = await cartService.getCart(userId);

            res.status(200).json({
                success: true,
                message: SUCCESS_MESSAGES.FETCHED,
                data: cart,
            });
        } catch (error) {
            console.log(error)
            next(error);
        }
    }

    // ============================
    // ADD ITEM TO CART
    // ============================

    async addItem(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.userId as string;
            const data = res.locals.body;

            const cart = await cartService.addItem(userId, data);

            res.status(200).json({
                success: true,
                message: SUCCESS_MESSAGES.CREATED,
                data: cart,
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
            const userId = req.user!.userId as string;
            const { itemId } = res.locals.params as { itemId: string };

            const data = res.locals.body;

            const cart = await cartService.updateItem(userId, itemId, data);

            res.status(200).json({
                success: true,
                message: SUCCESS_MESSAGES.UPDATED,
                data: cart,
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
            const userId = req.user!.userId as string;
            const { itemId } = res.locals.params as { itemId: string };

            const cart = await cartService.removeItem(userId, itemId);

            res.status(200).json({
                success: true,
                message: SUCCESS_MESSAGES.DELETED,
                data: cart,
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
            const userId = req.user!.userId as string;

            const cart = await cartService.clearCart(userId);

            res.status(200).json({
                success: true,
                message: SUCCESS_MESSAGES.DELETED,
                data: cart,
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