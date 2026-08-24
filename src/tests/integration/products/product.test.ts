import request from "supertest";
import { createId } from "@paralleldrive/cuid2";
import app from "@/app.js";
import { PRODUCT_MESSAGES } from "@/modules/catalog/product/constants/product.constants.js";
import { PRODUCT_ERRORS } from "@/modules/catalog/product/errors/product-errors.js";


// ====================
// PRODUCT API TESTS
// ====================

describe("Product API", async () => {

    const apiEndPoint = "/api/v1/products";
    const uniqueString = Date.now()

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



    // ==========================
    // POST /PRODUCTS TEST
    // ==========================
    describe("POST /products", () => {

        // CREATE A PRODUCT
        it("should create a new product", async () => {
            const productPayload = {
                name: `test-product-${uniqueString}`,
                slug: `test-product-${uniqueString}`,
                shortDescription: "Test- product short description",
                description: "Test product description",
                categoryId,
                brandId,
            };
            const response = await request(app)
                .post(apiEndPoint)
                .send(productPayload);
            // update result with first product data for next test use
            result = response.body.data;

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("id");
            expect(response.body.data.isPublished).toBe(true);
            expect(response.body.data.categoryId).toBe(categoryId);
            expect(response.body.data.brandId).toBe(brandId);
        });



        // REJECT DUPLICATE PRODUCT SLUG

        it("should reject duplicate product slug", async () => {
            const response = await request(app)
                .post(apiEndPoint)
                .send({
                    name: `test-Another-${uniqueString}`,
                    slug: result.slug,
                    categoryId,
                });

            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe(PRODUCT_ERRORS.PRODUCT_SLUG_EXISTS);
        });


        // INVALID CATEGORY

        it("should reject invalid category", async () => {
            const response = await request(app)
                .post(apiEndPoint)
                .send({
                    name: 123,
                    slug: 123,
                    categoryId: "xxxxxxxxxxxxxxxxxxxxxxxxxx",
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });


        // INVALID SLUG

        it("should reject invalid slug", async () => {
            const response = await request(app)
                .post(apiEndPoint)
                .send({
                    name: "test- new product name",
                    slug: 123,
                    categoryId,
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    // ===================
    // GET PRODUCts
    // ===================

    describe("GET /products/:id", () => {
        // Should return product by id
        it("should return product by id", async () => {
            const response = await request(app)
                .get(`${apiEndPoint}/${result.id}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(result.id);
        });

        // Product not found
        it("should return 404 for non-existing product", async () => {
            const response = await request(app)
                .get(`${apiEndPoint}/${createId()}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        // Reject invalid product id
        it("should reject invalid product id", async () => {
            const response = await request(app)
                .get(`${apiEndPoint}/invalid-id`);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });


    // GET PRODUCT BY SLUG

    describe("GET /products/slug/:slug", () => {

        // Return product by slug
        it("should return product by slug", async () => {
            const response = await request(app)
                .get(`${apiEndPoint}/slug/${result.slug}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.slug).toBe(result.slug);
        });

        // Reject for unmatched slug
        it("should return 404 for non-existing slug", async () => {
            const response = await request(app)
                .get(`${apiEndPoint}/slug/non-existing-product`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });


    // GET ALL PRODUCTS

    describe("GET /products", () => {

        // Return all products
        it("should return all products", async () => {
            const response = await request(app)
                .get(apiEndPoint);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });


    // GET ACTIVE PRODUCTS

    describe("GET /products/active", () => {

        // Return active products
        it("should return active products", async () => {
            const response = await request(app)
                .get(`${apiEndPoint}/active`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });


    // GET PUBLISHED PRODUCTS

    describe("GET /products/published", () => {
        // Return published products
        it("should return published products", async () => {
            const response = await request(app)
                .get(`${apiEndPoint}/published`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });


    // GET FEATURED PRODUCTS

    describe("GET /products/featured", () => {

        // Return featured products
        it("should return featured products", async () => {
            const response = await request(app)
                .get(`${apiEndPoint}/featured`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });


    // GET BY CATEGORY 

    describe("GET /products/category/:id", () => {

        // Return products by category
        it("should return products by category", async () => {
            const response = await request(app)
                .get(`${apiEndPoint}/category/${categoryId}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });


    // GET BY BRAND

    describe("GET /products/brand/:id", () => {
        it("should return products by brand", async () => {
            const response = await request(app)
                .get(`${apiEndPoint}/brand/${brandId}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });


    // SEARCH

    describe("GET /products/search", () => {
        it("should search products", async () => {
            const response = await request(app)
                .get(`${apiEndPoint}/search`)
                .query({ keyword: result.name, });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    // ===================
    // UPDATE PRODUCT
    // ===================

    describe("PATCH /products/:id", () => {
        it("should update product", async () => {
            const updatedName = "test- update product";

            const response = await request(app)
                .patch(`${apiEndPoint}/${result.id}`)
                .send({ name: updatedName });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(updatedName);
        });
    });

    // =================
    // FEATURE PRODUCT
    // =================

    describe("PATCH /products/:id/feature", () => {
        it("should feature product", async () => {
            const response = await request(app)
                .patch(`${apiEndPoint}/${result.id}/feature`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.isFeatured).toBe(true);
        });
    });

    // ===================
    // UNFEATURE PRODUCT
    // ===================

    describe("PATCH /products/:id/unfeature", () => {
        it("should unfeature product", async () => {
            const response = await request(app)
                .patch(`${apiEndPoint}/${result.id}/unfeature`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.isFeatured).toBe(false);
        });
    });

    // ==================
    // UNPUBLISH PRODUCT
    // ==================

    describe("PATCH /products/:id/unpublish", () => {
        it("should unpublish product", async () => {
            const response = await request(app)
                .patch(`${apiEndPoint}/${result.id}/unpublish`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.isPublished).toBe(false);
        });
    });

    // ================
    // PUBLISH PRODUCT
    // ================

    describe("PATCH /products/:id/publish", () => {
        it("should publish product", async () => {
            const response = await request(app)
                .patch(`${apiEndPoint}/${result.id}/publish`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.isPublished).toBe(true);
        });
    });

    // ====================
    // DEACTIVATE PRODUCT
    // ====================

    describe("PATCH /products/:id/deactivate", () => {
        it("should deactivate product", async () => {
            const response = await request(app)
                .patch(`${apiEndPoint}/${result.id}/deactivate`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.isActive).toBe(false);
        });
    });

    // =================
    // ACTIVATE PRODUCT
    // =================

    describe("PATCH /products/:id/activate", () => {
        it("should activate product", async () => {
            const response = await request(app)
                .patch(`${apiEndPoint}/${result.id}/activate`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.isActive).toBe(true);
        });
    });

    // ===============
    // COUNT PRODUCTS
    // ===============

    describe("GET /products/count", () => {
        it("should return product count", async () => {
            const response = await request(app)
                .get(`${apiEndPoint}/count`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(typeof response.body.data.count).toBe("number");
        });
    });

    // =======================
    // COUNT ACTIVE PRODUCTS
    // =======================

    describe("GET /products/count/active", () => {
        it("should return active product count", async () => {
            const response = await request(app)
                .get(`${apiEndPoint}/count/active`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(typeof response.body.data.count).toBe("number");
        });
    });

    // =========================
    // COUNT PUBLISHED PRODUCTS
    // ==========================

    describe("GET /products/count/published", () => {
        it("should return published product count", async () => {
            const response = await request(app)
                .get(`${apiEndPoint}/count/published`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(typeof response.body.data.count).toBe("number");
        });
    });

    // ================
    // DELETE PRODUCT
    // ================

    describe("DELETE /products/:id", () => {
        it("should soft delete product", async () => {
            const response = await request(app)
                .delete(`${apiEndPoint}/${result.id}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe(PRODUCT_MESSAGES.PRODUCT_DELETED);
        });
    });

    // =================
    // RESTORE PRODUCT
    // =================

    describe("PATCH /products/:id/restore", () => {
        it("should restore product", async () => {
            const response = await request(app)
                .patch(`${apiEndPoint}/${result.id}/restore`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.deletedAt).toBeNull();
            expect(response.body.data.isActive).toBe(true);
        });
    });
});