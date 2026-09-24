import request from "supertest";

import app from "@/app.js";

import { prisma } from "@/infrastructure/database/prisma/prisma.client.js";
import { VARIANT_ERRORS } from "@/modules/catalog/product/variant/variant.errors.js";
import { VARIANT_MESSAGES } from "@/modules/catalog/product/variant/variant.constants.js";


const apiEndPoint = "/api/v1/products/variants";
const uniqueString = Date.now();
const sku = `test-sku-${Date.now()}`;

interface Result {
    id: string;
    categoryId: string;
    brandId: string;
    name: string;
    slug: string;
    shortDescription: string;
    description: string;
}
let result: Partial<Result> = {};

let productId: string;
let variantId: string;
let secondVariantId: string;

// =====================
// VARIANT TEST SUITE
// =====================

describe("Product Variant API", async () => {

    // CREATE A CATEGORY BEFORE CREATING A PRODUCT

    const categoryApiEndPoint = "/api/v1/categories";
    const categoryPayload = {
        name: `test-category-${uniqueString}`,
        slug: `test-category-${uniqueString}`,
        description: "Test category items"
    };

    const category = await request(app)
        .post(categoryApiEndPoint)
        .send(categoryPayload);
    const categoryId = category.body.data.id;


    // CREATE A BRAND BEFORE CREATING A PRODUCT
    const brandApiEndPoint = "/api/v1/brands";
    const brandPayload = {
        name: `test- brand ${uniqueString}`,
        slug: `test-brand-${uniqueString}`,
    }

    const brand = await request(app)
        .post(brandApiEndPoint)
        .send(brandPayload);
    const brandId = brand.body.data.id;

    const productApiEndPoint = "/api/v1/products";
    const productPayload = {
        name: `test-product-${uniqueString}`,
        slug: `test-product-${uniqueString}`,
        shortDescription: "Test- product short description",
        description: "Test product description",
        categoryId,
        brandId,
    };
    const product = await request(app)
        .post(productApiEndPoint)
        .send(productPayload);

    const productId = product.body.data.id;



    // ========================================================
    // CREATE
    // ========================================================

    describe("POST /products/variants", () => {

        it("should create a product variant", async () => {

            const response = await request(app)
                .post(apiEndPoint)
                .send({
                    productId,
                    sku,
                    price: 100,
                    costPrice: 70,
                    isDefault: true,
                    isActive: true,
                    trackInventory: true,
                    weight: 1.5,
                    length: 10,
                    width: 5,
                    height: 3,
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();

            expect(response.body.data.productId)
                .toBe(productId);

            expect(response.body.data.isDefault)
                .toBe(true);

            variantId = response.body.data.id;
        });

        it("should reject duplicate SKU", async () => {
            const response = await request(app)
                .post(apiEndPoint)
                .send({
                    productId,
                    sku,
                    price: 150,
                });

            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
        });

        it("should reject invalid product ID", async () => {

            const response = await request(app)
                .post(apiEndPoint)
                .send({
                    productId: "invalid-product-id",
                    sku: `INVALID-${Date.now()}`,
                    price: 100,
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    // ========================================================
    // GET ALL
    // ========================================================

    describe("GET /products/variants", () => {

        it("should return all variants", async () => {

            const response = await request(app)
                .get(apiEndPoint);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data))
                .toBe(true);
        });
    });

    // ========================================================
    // GET ACTIVE
    // ========================================================

    describe("GET /products/variants/active", () => {

        it("should return active variants", async () => {

            const response = await request(app)
                .get(`${apiEndPoint}/active`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data))
                .toBe(true);
        });
    });

    // ========================================================
    // GET BY ID
    // ========================================================

    describe("GET /products/variants/:id", () => {

        it("should return variant by ID", async () => {

            const response = await request(app)
                .get(`${apiEndPoint}/${variantId}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            expect(response.body.data.id)
                .toBe(variantId);
        });

        it("should return 404 for non-existing variant", async () => {

            const response = await request(app)
                .get(
                    `${apiEndPoint}/cmabcdefghijklmnoptuvwxn`
                );

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    // ========================================================
    // GET BY SKU
    // ========================================================

    describe("GET /products/variants/sku/:sku", () => {

        it("should return variant by SKU", async () => {

            const variant = await prisma.productVariant.findUnique({
                where: {
                    id: variantId,
                },
            });

            const response = await request(app)
                .get(
                    `${apiEndPoint}/sku/${variant!.sku}`
                );

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            expect(response.body.data.id)
                .toBe(variantId);
        });
    });

    // ========================================================
    // GET BY PRODUCT
    // ========================================================

    describe(
        "GET /products/variants/product/:productId",
        () => {

            it("should return variants by product", async () => {

                const response = await request(app)
                    .get(
                        `${apiEndPoint}/product/${productId}`
                    );

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);

                expect(Array.isArray(response.body.data))
                    .toBe(true);
            });
        }
    );

    // ========================================================
    // GET ACTIVE BY PRODUCT
    // ========================================================

    describe(
        "GET /products/variants/product/:productId/active",
        () => {

            it("should return active variants by product", async () => {

                const response = await request(app)
                    .get(
                        `${apiEndPoint}/product/${productId}/active`
                    );

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);

                expect(Array.isArray(response.body.data))
                    .toBe(true);
            });
        }
    );

    // ========================================================
    // GET DEFAULT BY PRODUCT
    // ========================================================

    describe(
        "GET /products/variants/product/:productId/default",
        () => {

            it("should return default variant", async () => {

                const response = await request(app)
                    .get(
                        `${apiEndPoint}/product/${productId}/default`
                    );

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);

                expect(response.body.data.isDefault)
                    .toBe(true);
            });
        }
    );

    // ========================================================
    // GET BY BARCODE
    // ========================================================

    describe(
        "GET /products/variants/barcode/:barcode",
        () => {

            it("should return variant by barcode", async () => {

                await prisma.productVariant.update({
                    where: {
                        id: variantId,
                    },
                    data: {
                        barcode: `BARCODE-${Date.now()}`,
                    },
                });

                const variant =
                    await prisma.productVariant.findUnique({
                        where: {
                            id: variantId,
                        },
                    });

                const response = await request(app)
                    .get(
                        `${apiEndPoint}/barcode/${variant!.barcode}`
                    );

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);

                expect(response.body.data.id)
                    .toBe(variantId);
            });
        }
    );

    // ========================================================
    // UPDATE
    // ========================================================

    describe("PATCH /products/variants/:id", () => {

        it("should update variant", async () => {

            const response = await request(app)
                .patch(`${apiEndPoint}/${variantId}`)
                .send({
                    price: 200,
                    costPrice: 120,
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            expect(Number(response.body.data.price))
                .toBe(200);
        });
    });

    // ========================================================
    // CREATE SECOND VARIANT
    // ========================================================

    describe("Create second variant", () => {

        it("should create another variant", async () => {

            const response = await request(app)
                .post(apiEndPoint)
                .send({
                    productId,
                    sku: `SECOND-SKU-${Date.now()}`,
                    price: 250,
                    isDefault: false,
                    isActive: true,
                    trackInventory: true,
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);

            secondVariantId = response.body.data.id;
        });
    });

    // ========================================================
    // SET DEFAULT
    // ========================================================

    describe(
        "PATCH /products/variants/:id/default",
        () => {

            it("should set variant as default", async () => {

                const response = await request(app)
                    .patch(
                        `${apiEndPoint}/${secondVariantId}/default`
                    );

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);

                expect(response.body.data.isDefault)
                    .toBe(true);

                // Previous default should now be false
                const previous =
                    await prisma.productVariant.findUnique({
                        where: {
                            id: variantId,
                        },
                    });

                expect(previous!.isDefault)
                    .toBe(false);
            });
        }
    );

    // ========================================================
    // UNSET DEFAULT
    // ========================================================

    describe(
        "PATCH /products/variants/:id/default/remove",
        () => {

            it("should unset default variant", async () => {

                const response = await request(app)
                    .patch(
                        `${apiEndPoint}/${secondVariantId}/default/remove`
                    );

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);

                expect(response.body.data.isDefault)
                    .toBe(false);
            });
        }
    );

    // ========================================================
    // DEACTIVATE
    // ========================================================

    describe(
        "PATCH /products/variants/:id/deactivate",
        () => {

            it("should deactivate variant", async () => {

                const response = await request(app)
                    .patch(
                        `${apiEndPoint}/${secondVariantId}/deactivate`
                    );

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);

                expect(response.body.data.isActive)
                    .toBe(false);
            });
        }
    );

    // ========================================================
    // ACTIVATE
    // ========================================================

    describe(
        "PATCH /products/variants/:id/activate",
        () => {

            it("should activate variant", async () => {

                const response = await request(app)
                    .patch(
                        `${apiEndPoint}/${secondVariantId}/activate`
                    );

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);

                expect(response.body.data.isActive)
                    .toBe(true);
            });
        }
    );

    // ========================================================
    // COUNT
    // ========================================================

    describe("GET /products/variants/count", () => {

        it("should return variant count", async () => {

            const response = await request(app)
                .get(`${apiEndPoint}/count`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(typeof response.body.data)
                .toBe("number");
        });
    });

    // ========================================================
    // COUNT ACTIVE
    // ========================================================

    describe(
        "GET /products/variants/count/active",
        () => {

            it("should return active variant count", async () => {

                const response = await request(app)
                    .get(
                        `${apiEndPoint}/count/active`
                    );

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(typeof response.body.data)
                    .toBe("number");
            });
        }
    );

    // ========================================================
    // COUNT BY PRODUCT
    // ========================================================

    describe(
        "GET /products/variants/product/:productId/count",
        () => {

            it("should return product variant count", async () => {

                const response = await request(app)
                    .get(
                        `${apiEndPoint}/product/${productId}/count`
                    );

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(typeof response.body.data)
                    .toBe("number");
            });
        }
    );

    // ========================================================
    // DELETE
    // ========================================================

    describe("DELETE /products/variants/:id", () => {

        it("should soft delete variant", async () => {

            const response = await request(app)
                .delete(
                    `${apiEndPoint}/${secondVariantId}`
                );

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe(VARIANT_MESSAGES.PRODUCT_VARIANT_DELETED);
        });
    });

    // ========================================================
    // RESTORE
    // ========================================================

    describe(
        "PATCH /products/variants/:id/restore",
        () => {

            it("should restore variant", async () => {

                const response = await request(app)
                    .patch(
                        `${apiEndPoint}/${secondVariantId}/restore`
                    );

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);

                expect(response.body.data.deletedAt)
                    .toBeNull();
            });
        }
    );
});