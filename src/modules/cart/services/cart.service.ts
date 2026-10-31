import { createHash, randomBytes } from "node:crypto";
import { BadRequestError, NotFoundError } from "@/shared/errors/index.js";
import { CART_ERRORS } from "../constants/cart.errors.js";
import type { AddCartItemInput, UpdateCartItemInput } from "../types/cart.types.js";
import { cartRepository } from "../repositories/cart.repository.js";

// ============================
// CART TYPES
// ============================

type CartRecord = NonNullable<Awaited<ReturnType<typeof cartRepository.findByUserId>>>;

type CartResult = {
    cart: CartRecord;
    guestToken?: string;
};

// ============================
// GUEST CART CONFIGURATION
// ============================

const GUEST_CART_TTL_DAYS = 10;

// ============================
// CART SERVICE
// ============================

class CartService {

    // ============================
    // HASH GUEST TOKEN
    // ============================

    private hashGuestToken(token: string): string {
        return createHash("sha256")
            .update(token)
            .digest("hex");
    }

    // ============================
    // CREATE GUEST TOKEN
    // ============================

    private generateGuestToken(): string {
        return randomBytes(32).toString("hex");
    }

    // ============================
    // CREATE GUEST CART
    // ============================

    private async createGuestCart(): Promise<CartResult> {

        const guestToken = this.generateGuestToken();
        const guestTokenHash = this.hashGuestToken(guestToken);
        const expiresAt = new Date(Date.now() + GUEST_CART_TTL_DAYS * 24 * 60 * 60 * 1000);

        const cart = await cartRepository.createGuestCart(guestTokenHash, expiresAt);

        return { cart, guestToken };
    }

    // ============================
    // RESOLVE CART
    // ============================

    private async resolveCart(userId?: string, guestToken?: string, createIfMissing = true): Promise<CartResult | null> {

        // AUTHENTICATED USER CART

        if (userId) {
            const cart = await cartRepository.findOrCreateByUserId(userId);
            return { cart };
        }

        // GUEST CART

        if (!guestToken) {
            return createIfMissing
                ? await this.createGuestCart()
                : null;
        }

        const guestTokenHash = this.hashGuestToken(guestToken);

        const cart = await cartRepository.findByGuestTokenHash(guestTokenHash);

        if (!cart) {
            return createIfMissing
                ? await this.createGuestCart()
                : null;
        }

        // CHECK GUEST CART EXPIRATION

        if (cart.expiresAt && cart.expiresAt <= new Date()) {
            await cartRepository.deleteGuestCart(
                cart.id,
                guestTokenHash
            );

            return createIfMissing
                ? await this.createGuestCart()
                : null;
        }

        return { cart };
    }

    // ============================
    // FIND PRODUCT VARIANT
    // ============================

    private async getVariant(variantId: string) {
        const variant = await cartRepository.findVariantById(variantId);

        if (!variant) {
            throw new NotFoundError(
                CART_ERRORS.PRODUCT_VARIANT_NOT_FOUND
            );
        }

        if (!variant.isActive || variant.deletedAt) {
            throw new BadRequestError(
                CART_ERRORS.PRODUCT_VARIANT_INACTIVE
            );
        }

        if (
            !variant.product.isActive ||
            !variant.product.isPublished ||
            variant.product.deletedAt
        ) {
            throw new BadRequestError(
                CART_ERRORS.PRODUCT_UNAVAILABLE
            );
        }

        return variant;
    }

    // ============================
    // VALIDATE STOCK AVAILABILITY
    // ============================

    private validateStock(
        variant: {
            trackInventory: boolean;
            inventory: {
                quantity: number;
                reservedQuantity: number;
                allowBackorder: boolean;
            } | null;
        },
        quantity: number
    ): void {

        if (
            !variant.trackInventory ||
            variant.inventory?.allowBackorder
        ) {
            return;
        }

        const availableQuantity =
            (variant.inventory?.quantity ?? 0) -
            (variant.inventory?.reservedQuantity ?? 0);

        if (quantity > availableQuantity) {
            throw new BadRequestError(
                CART_ERRORS.INSUFFICIENT_STOCK
            );
        }
    }

    // ============================
    // REFRESH CART RESULT
    // ============================

    private async refreshCart(cartId: string, guestToken?: string): Promise<CartResult> {

        const cart = await cartRepository.findById(cartId);

        if (!cart) {
            throw new NotFoundError(CART_ERRORS.CART_NOT_FOUND);
        }

        return guestToken
            ? { cart, guestToken }
            : { cart };
    }

    // ============================
    // GET CART
    // ============================

    async getCart(userId?: string, guestToken?: string) {
        return await this.resolveCart(userId, guestToken);
    }

    // ============================
    // ADD ITEM TO CART
    // ============================

    async addItem(data: AddCartItemInput, userId?: string, guestToken?: string) {

        const variant = await this.getVariant(data.variantId);
        const resolved = await this.resolveCart(userId, guestToken);

        if (!resolved) {
            throw new NotFoundError(CART_ERRORS.CART_NOT_FOUND);
        }

        const { cart } = resolved;
        const existingItem = await cartRepository.findItemByVariant(cart.id, data.variantId);

        const totalQuantity = (existingItem?.quantity ?? 0) + data.quantity;

        this.validateStock(variant, totalQuantity);

        await cartRepository.upsertItem(cart.id, data.variantId, data.quantity);

        return await this.refreshCart(cart.id, resolved.guestToken);
    }

    // ============================
    // UPDATE CART ITEM QUANTITY
    // ============================

    async updateItem(itemId: string, data: UpdateCartItemInput, userId?: string, guestToken?: string) {

        const resolved = await this.resolveCart(userId, guestToken, false);

        if (!resolved) {
            throw new NotFoundError(CART_ERRORS.CART_NOT_FOUND);
        }

        const { cart } = resolved;

        const item = await cartRepository.findItemById(cart.id, itemId);

        if (!item) {
            throw new NotFoundError(CART_ERRORS.CART_ITEM_NOT_FOUND);
        }

        const variant = await this.getVariant(item.variantId);

        this.validateStock(variant, data.quantity);

        const result = await cartRepository.updateItemQuantity(cart.id, itemId, data.quantity);

        if (result.count === 0) {
            throw new NotFoundError(CART_ERRORS.CART_ITEM_NOT_FOUND);
        }

        return await this.refreshCart(cart.id);
    }

    // ============================
    // REMOVE ITEM FROM CART
    // ============================

    async removeItem(itemId: string, userId?: string, guestToken?: string) {

        const resolved = await this.resolveCart(userId, guestToken, false);

        if (!resolved) {
            throw new NotFoundError(CART_ERRORS.CART_NOT_FOUND);
        }

        const { cart } = resolved;

        const result = await cartRepository.deleteItem(cart.id, itemId);

        if (result.count === 0) {
            throw new NotFoundError(CART_ERRORS.CART_ITEM_NOT_FOUND);
        }

        return await this.refreshCart(cart.id);
    }

    // ============================
    // CLEAR CART
    // ============================

    async clearCart(userId?: string, guestToken?: string) {

        const resolved = await this.resolveCart(userId, guestToken, false);

        if (!resolved) {
            throw new NotFoundError(CART_ERRORS.CART_NOT_FOUND);
        }

        const { cart } = resolved;

        await cartRepository.clearItems(cart.id);

        return await this.refreshCart(cart.id);
    }

    // ============================
    // MERGE GUEST CART INTO USER CART
    // ============================

    async mergeGuestCart(userId: string, guestToken: string) {

        const guestTokenHash = this.hashGuestToken(guestToken);

        const guestCart = await cartRepository.findByGuestTokenHash(guestTokenHash);

        const userCart = await cartRepository.findByUserId(userId);

        if (!guestCart) {
            return userCart ??
                await cartRepository.findOrCreateByUserId(userId);
        }

        // CHECK GUEST CART EXPIRATION

        if (guestCart.expiresAt && guestCart.expiresAt <= new Date()) {
            await cartRepository.deleteGuestCart(guestCart.id, guestTokenHash);

            return userCart ??
                await cartRepository.findOrCreateByUserId(userId);
        }

        // VALIDATE GUEST CART ITEMS

        for (const item of guestCart.items) {
            const variant = await this.getVariant(item.variantId);

            const existingItem = userCart
                ? await cartRepository.findItemByVariant(
                    userCart.id,
                    item.variantId
                )
                : null;

            const totalQuantity = item.quantity + (existingItem?.quantity ?? 0);

            this.validateStock(variant, totalQuantity);
        }

        // NO EXISTING USER CART: CLAIM GUEST CART

        if (!userCart) {
            const result = await cartRepository.claimGuestCart(
                guestCart.id,
                guestTokenHash,
                userId
            );

            if (result.count === 0) {
                throw new NotFoundError(CART_ERRORS.CART_NOT_FOUND);
            }

            const claimedCart = await cartRepository.findByUserId(userId);

            if (!claimedCart) {
                throw new NotFoundError(CART_ERRORS.CART_NOT_FOUND);
            }

            return claimedCart;
        }

        // EXISTING USER CART: MERGE ITEMS

        return await cartRepository.mergeGuestCart(guestCart.id, userCart.id);
    }
}

// ============================
// EXPORT CART SERVICE
// ============================

export const cartService = new CartService();
