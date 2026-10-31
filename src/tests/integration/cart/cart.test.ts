
import { describe, it, expect } from "vitest";
import request from "supertest";
import { prisma } from "@/infrastructure/database/prisma/prisma.client.js";

import app from "@/app.js";
import { SUCCESS_MESSAGES } from "@/shared/constants/success-messages.js";

const authEndpoint = "/api/v1/auth";
const categoriesEndpoint = "/api/v1/categories";
const brandsEndpoint = "/api/v1/brands";
const productsEndpoint = "/api/v1/products";
const cartEndpoint = "/api/v1/cart";

const uniqueString = Date.now();

let accessToken = "";
let guestCookie = "";

// ============================
// TEST DATA
// ============================

let categoryId: string;
let brandId: string;
let productId: string;
let variantId: string;
let cartItemId: string;
let guestCartId: string;

const sku = `test-cart-sku-${uniqueString}`;

const testUser = {
    firstName: "Cart",
    lastName: "Tester",
    email: `test-cart-${uniqueString}@example.com`,
    password: "Password123",
};


// ============================
// CART TEST SETUP
// ============================

// REGISTER A TEST USER

const user = await request(app)
    .post(`${authEndpoint}/register`)
    .send(testUser);

expect(user.status).toBe(201);

accessToken = user.body.data.tokens.accessToken;


// CREATE A CATEGORY

const category = await request(app)
    .post(categoriesEndpoint)
    .send({
        name: `test-cart-category-${uniqueString}`,
        slug: `test-cart-category-${uniqueString}`,
        description: "Test cart category",
    });

expect(category.status).toBe(201);

categoryId = category.body.data.id;


// CREATE A BRAND

const brand = await request(app)
    .post(brandsEndpoint)
    .send({
        name: `test-cart-brand-${uniqueString}`,
        slug: `test-cart-brand-${uniqueString}`,
    });

expect(brand.status).toBe(201);

brandId = brand.body.data.id;


// CREATE A PRODUCT

const product = await request(app)
    .post(productsEndpoint)
    .send({
        name: `test-cart-product-${uniqueString}`,
        slug: `test-cart-product-${uniqueString}`,
        shortDescription: "Test cart product",
        description: "Test product for cart operations",
        categoryId,
        brandId,
    });

expect(product.status).toBe(201);

productId = product.body.data.id;


// CREATE A PRODUCT VARIANT

const variant = await request(app)
    .post(`${productsEndpoint}/${productId}/variants`)
    .send({
        sku,
        price: 100,
        costPrice: 70,
        isDefault: true,
        isActive: true,
        trackInventory: false,
    });

expect(variant.status).toBe(201);

variantId = variant.body.data.id;


// ============================
// CART API TESTS
// ============================

describe("Cart API", () => {

    // ============================
    // AUTHENTICATED CART
    // ============================

    describe("Authenticated Cart", () => {

        // ============================
        // GET CART
        // ============================

        describe("GET /cart", () => {

            it("should return the authenticated user's cart", async () => {
                const response = await request(app)
                    .get(cartEndpoint)
                    .set("Authorization", `Bearer ${accessToken}`);

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toBe(SUCCESS_MESSAGES.FETCHED);
                expect(response.body.data).toHaveProperty("id");
                expect(response.body.data.items).toEqual([]);
            });

        });


        // ============================
        // ADD ITEM TO CART
        // ============================

        describe("POST /cart/items", () => {

            it("should add a product variant to the cart", async () => {
                const response = await request(app)
                    .post(`${cartEndpoint}/items`)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({
                        variantId,
                        quantity: 1,
                    });

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toBe(SUCCESS_MESSAGES.CREATED);

                expect(response.body.data.items).toHaveLength(1);
                expect(response.body.data.items[0].variantId).toBe(variantId);
                expect(response.body.data.items[0].quantity).toBe(1);

                cartItemId = response.body.data.items[0].id;
            });


            it("should increment the quantity when adding an existing variant", async () => {
                const response = await request(app)
                    .post(`${cartEndpoint}/items`)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({
                        variantId,
                        quantity: 2,
                    });

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);

                expect(response.body.data.items).toHaveLength(1);
                expect(response.body.data.items[0].quantity).toBe(3);
            });


            it("should reject an invalid variant ID", async () => {
                const response = await request(app)
                    .post(`${cartEndpoint}/items`)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({
                        variantId: "invalid-variant-id",
                        quantity: 1,
                    });

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
            });


            it("should reject a zero quantity", async () => {
                const response = await request(app)
                    .post(`${cartEndpoint}/items`)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({
                        variantId,
                        quantity: 0,
                    });

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
            });


            it("should return 404 for a non-existing variant", async () => {
                const response = await request(app)
                    .post(`${cartEndpoint}/items`)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({
                        variantId: "cmabcdefghijklmnoptuvwxn",
                        quantity: 1,
                    });

                expect(response.status).toBe(404);
                expect(response.body.success).toBe(false);
            });

        });


        // ============================
        // UPDATE CART ITEM
        // ============================

        describe("PATCH /cart/items/:itemId", () => {

            it("should update the cart item quantity", async () => {
                const response = await request(app)
                    .patch(`${cartEndpoint}/items/${cartItemId}`)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({
                        quantity: 5,
                    });

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toBe(SUCCESS_MESSAGES.UPDATED);

                expect(response.body.data.items[0].quantity).toBe(5);
            });


            it("should reject a zero quantity", async () => {
                const response = await request(app)
                    .patch(`${cartEndpoint}/items/${cartItemId}`)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({
                        quantity: 0,
                    });

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
            });


            it("should reject an invalid cart item ID", async () => {
                const response = await request(app)
                    .patch(`${cartEndpoint}/items/invalid-item-id`)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({
                        quantity: 2,
                    });

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
            });


            it("should return 404 for a non-existing cart item", async () => {
                const response = await request(app)
                    .patch(`${cartEndpoint}/items/cmabcdefghijklmnoptuvwxn`)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({
                        quantity: 2,
                    });

                expect(response.status).toBe(404);
                expect(response.body.success).toBe(false);
            });

        });


        // ============================
        // REMOVE CART ITEM
        // ============================

        describe("DELETE /cart/items/:itemId", () => {

            it("should remove an item from the cart", async () => {
                const response = await request(app)
                    .delete(`${cartEndpoint}/items/${cartItemId}`)
                    .set("Authorization", `Bearer ${accessToken}`);

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toBe(SUCCESS_MESSAGES.DELETED);

                expect(response.body.data.items).toHaveLength(0);
            });


            it("should return 404 for a non-existing cart item", async () => {
                const response = await request(app)
                    .delete(`${cartEndpoint}/items/cmabcdefghijklmnoptuvwxn`)
                    .set("Authorization", `Bearer ${accessToken}`);

                expect(response.status).toBe(404);
                expect(response.body.success).toBe(false);
            });

        });


        // ============================
        // CLEAR CART
        // ============================

        describe("DELETE /cart/items", () => {

            it("should add an item before clearing the cart", async () => {
                const response = await request(app)
                    .post(`${cartEndpoint}/items`)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({
                        variantId,
                        quantity: 2,
                    });

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data.items).toHaveLength(1);
            });


            it("should clear all items from the cart", async () => {
                const response = await request(app)
                    .delete(`${cartEndpoint}/items`)
                    .set("Authorization", `Bearer ${accessToken}`);

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toBe(SUCCESS_MESSAGES.DELETED);

                expect(response.body.data.items).toHaveLength(0);
            });


            it("should retain the cart after clearing its items", async () => {
                const response = await request(app)
                    .get(cartEndpoint)
                    .set("Authorization", `Bearer ${accessToken}`);

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data.id).toBeDefined();
                expect(response.body.data.items).toHaveLength(0);
            });

        });

    });


    // ============================
    // GUEST CART
    // ============================

    describe("Guest Cart", () => {

        // ============================
        // GET CART
        // ============================

        describe("GET /cart", () => {

            it("should create and return a guest cart", async () => {
                const response = await request(app)
                    .get(cartEndpoint);

                guestCartId = response.body.data.id;

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toBe(SUCCESS_MESSAGES.FETCHED);

                expect(response.body.data).toHaveProperty("id");
                expect(response.body.data.items).toEqual([]);

                // Capture the guest cart cookie.
                const setCookie = response.headers["set-cookie"];

                expect(setCookie).toBeDefined();

                const cookieHeader = Array.isArray(setCookie)
                    ? setCookie[0]
                    : setCookie;

                expect(cookieHeader).toBeDefined();
                expect(cookieHeader).toContain("guestCartToken=");

                guestCookie = cookieHeader!.split(";")[0]!;

                expect(guestCookie).toBeTruthy();

                // The raw guest token must not appear in the response body.
                expect(JSON.stringify(response.body)).not.toContain(
                    guestCookie.split("=")[1],
                );
            });


            it("should return the existing guest cart using its cookie", async () => {
                const response = await request(app)
                    .get(cartEndpoint)
                    .set("Cookie", guestCookie);

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data).toHaveProperty("id");
                expect(response.body.data.items).toEqual([]);
            });


            it("should reject an invalid supplied access token", async () => {
                const response = await request(app)
                    .get(cartEndpoint)
                    .set("Authorization", "Bearer invalid-token");

                expect(response.status).toBe(401);
                expect(response.body.success).toBe(false);
            });

        });


        // ============================
        // ADD ITEM TO CART
        // ============================

        describe("POST /cart/items", () => {

            it("should add a product variant to the guest cart", async () => {
                const response = await request(app)
                    .post(`${cartEndpoint}/items`)
                    .set("Cookie", guestCookie)
                    .send({
                        variantId,
                        quantity: 1,
                    });

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toBe(SUCCESS_MESSAGES.CREATED);

                expect(response.body.data.items).toHaveLength(1);
                expect(response.body.data.items[0].variantId).toBe(variantId);
                expect(response.body.data.items[0].quantity).toBe(1);
            });


            it("should increment the quantity when adding an existing variant", async () => {
                const response = await request(app)
                    .post(`${cartEndpoint}/items`)
                    .set("Cookie", guestCookie)
                    .send({
                        variantId,
                        quantity: 2,
                    });

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);

                expect(response.body.data.items).toHaveLength(1);
                expect(response.body.data.items[0].quantity).toBe(3);
            });

        });


        // ============================
        // UPDATE CART ITEM
        // ============================

        describe("PATCH /cart/items/:itemId", () => {

            it("should update the guest cart item quantity", async () => {
                const guestItemId = (
                    await request(app)
                        .get(cartEndpoint)
                        .set("Cookie", guestCookie)
                ).body.data.items[0].id;

                const response = await request(app)
                    .patch(`${cartEndpoint}/items/${guestItemId}`)
                    .set("Cookie", guestCookie)
                    .send({
                        quantity: 5,
                    });

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toBe(SUCCESS_MESSAGES.UPDATED);

                expect(response.body.data.items[0].quantity).toBe(5);
            });

        });


        // ============================
        // REMOVE CART ITEM
        // ============================

        describe("DELETE /cart/items/:itemId", () => {

            it("should remove an item from the guest cart", async () => {
                const guestItemId = (
                    await request(app)
                        .get(cartEndpoint)
                        .set("Cookie", guestCookie)
                ).body.data.items[0].id;

                const response = await request(app)
                    .delete(`${cartEndpoint}/items/${guestItemId}`)
                    .set("Cookie", guestCookie);

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toBe(SUCCESS_MESSAGES.DELETED);

                expect(response.body.data.items).toHaveLength(0);
            });

        });


        // ============================
        // CLEAR CART
        // ============================

        describe("DELETE /cart/items", () => {

            it("should add items before clearing the guest cart", async () => {
                const response = await request(app)
                    .post(`${cartEndpoint}/items`)
                    .set("Cookie", guestCookie)
                    .send({
                        variantId,
                        quantity: 2,
                    });

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data.items).toHaveLength(1);
            });


            it("should clear all items from the guest cart", async () => {
                const response = await request(app)
                    .delete(`${cartEndpoint}/items`)
                    .set("Cookie", guestCookie);

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toBe(SUCCESS_MESSAGES.DELETED);

                expect(response.body.data.items).toHaveLength(0);
            });


            it("should retain the guest cart after clearing its items", async () => {
                const response = await request(app)
                    .get(cartEndpoint)
                    .set("Cookie", guestCookie);

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data.id).toBeDefined();
                expect(response.body.data.items).toHaveLength(0);
            });

        });

    });

});

afterAll(async () => {
    if (guestCartId) {
        await prisma.cart.deleteMany({
            where: {
                id: guestCartId,
                userId: null,
            },
        });
    }
});