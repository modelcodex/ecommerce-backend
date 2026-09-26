import request from "supertest";

import app from "@/app.js";
import { prisma } from "@/infrastructure/database/prisma/prisma.client.js";

import { INVENTORY_ERRORS } from "@/modules/catalog/inventory/inventory.errors.js";
import { INVENTORY_MESSAGES } from "@/modules/catalog/inventory/inventory.constants.js";


// =========================
// INVENTORY TESTS
// =========================

describe("Inventory API", () => {

    const apiEndPoint = "/api/v1/products/inventory";

    let categoryId: string;
    let brandId: string;
    let productId: string;
    let variantId: string;
    let secondVariantId: string;
    let inventoryId: string;

    // =========================
    // CREATE TEST DATA
    // =========================

    it("should create temporary test data", async () => {

        // =========================
        // CREATE CATEGORY
        // =========================

        const category = await prisma.category.create({
            data: {
                name: "test-inventory-category",
                slug: "test-inventory-category",
                description: "Temporary category for inventory tests.",
            },
        });

        categoryId = category.id;

        // =========================
        // CREATE BRAND
        // =========================

        const brand = await prisma.brand.create({
            data: {
                name: "test-inventory-brand",
                slug: "test-inventory-brand",
                description: "Temporary brand for inventory tests.",
            },
        });

        brandId = brand.id;

        // =========================
        // CREATE PRODUCT
        // =========================

        const product = await prisma.product.create({
            data: {
                name: "test-inventory-product",
                slug: "test-inventory-product",
                description: "Temporary product for inventory tests.",
                categoryId,
                brandId,
            },
        });

        productId = product.id;

        // =========================
        // CREATE FIRST VARIANT
        // =========================

        const variant = await prisma.productVariant.create({
            data: {
                productId,
                sku: "test-inventory-sku-001",
                price: 100,
                costPrice: 70,
                isDefault: true,
                isActive: true,
                trackInventory: true,
            },
        });

        variantId = variant.id;

        // =========================
        // CREATE SECOND VARIANT
        // =========================

        const secondVariant = await prisma.productVariant.create({
            data: {
                productId,
                sku: "test-inventory-sku-002",
                price: 120,
                costPrice: 80,
                isDefault: false,
                isActive: true,
                trackInventory: true,
            },
        });

        secondVariantId = secondVariant.id;

        // =========================
        // VERIFY TEST DATA
        // =========================

        expect(categoryId).toBeDefined();
        expect(brandId).toBeDefined();
        expect(productId).toBeDefined();
        expect(variantId).toBeDefined();
        expect(secondVariantId).toBeDefined();
    });

    // =========================
    // CREATE INVENTORY
    // =========================

    it("should create inventory", async () => {

        const response = await request(app)
            .post(apiEndPoint)
            .send({
                variantId,
                quantity: 100,
                reservedQuantity: 10,
                allowBackorder: false,
                lowStockAlert: 20,
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);

        expect(response.body.data).toHaveProperty("id");
        expect(response.body.data.variantId).toBe(variantId);
        expect(response.body.data.quantity).toBe(100);
        expect(response.body.data.reservedQuantity).toBe(10);
        expect(response.body.data.allowBackorder).toBe(false);
        expect(response.body.data.lowStockAlert).toBe(20);

        inventoryId = response.body.data.id;
    });

    // =========================
    // DUPLICATE INVENTORY
    // =========================

    it("should not create duplicate inventory for the same variant", async () => {

        const response = await request(app)
            .post(apiEndPoint)
            .send({
                variantId,
                quantity: 50,
            });

        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);

        expect(response.body.message).toBe(INVENTORY_ERRORS.INVENTORY_ALREADY_EXISTS);
    });

    // =========================
    // INVALID VARIANT ID
    // =========================

    it("should reject invalid variant ID", async () => {

        const response = await request(app)
            .post(apiEndPoint)
            .send({
                variantId: "invalid-id",
                quantity: 100,
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    // ===========================
    // REJECT NON-EXISTENT VARIANT
    // ===========================

    it("should fail db relationship for non-existent variant", async () => {

        const response = await request(app)
            .post(apiEndPoint)
            .send({
                variantId: "cmabcdefghijklmnoptuvwxn",
                quantity: 100,
            });
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    // ===========================================
    // REJECT IF RESERVED IS GREATER THAN QUANTITY
    // ============================================

    it("should reject reserved quantity greater than quantity", async () => {

        const response = await request(app)
            .post(apiEndPoint)
            .send({
                variantId: secondVariantId,
                quantity: 10,
                reservedQuantity: 20,
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);

        expect(response.body.message).toBe(
            INVENTORY_ERRORS.RESERVED_QUANTITY_EXCEEDS_STOCK
        );
    });

    // =========================
    // GET BY ID
    // =========================

    it("should get inventory by ID", async () => {

        const response = await request(app)
            .get(`${apiEndPoint}/${inventoryId}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        expect(response.body.data.id).toBe(inventoryId);
        expect(response.body.data.variantId).toBe(variantId);
        expect(response.body.data.quantity).toBe(100);
        expect(response.body.data.reservedQuantity).toBe(10);
    });

    // =========================
    // GET NON-EXISTENT INVENTORY
    // =========================

    it("should return 404 for non-existent inventory", async () => {

        const response = await request(app)
            .get(`${apiEndPoint}/cm1234567890123456789012`);


        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);

        expect(response.body.message).toBe(
            INVENTORY_ERRORS.INVENTORY_NOT_FOUND
        );
    });

    // =========================
    // GET BY VARIANT ID
    // =========================

    it("should get inventory by variant ID", async () => {

        const response = await request(app)
            .get(`${apiEndPoint}/variant/${variantId}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        expect(response.body.data.id).toBe(inventoryId);
        expect(response.body.data.variantId).toBe(variantId);
    });

    // ================================
    // GET BY VARIANT WITHOUT INVENTORY
    // ================================

    it("should return 404 when variant has no inventory", async () => {

        const response = await request(app)
            .get(`${apiEndPoint}/variant/${secondVariantId}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);

        expect(response.body.message).toBe(INVENTORY_ERRORS.INVENTORY_NOT_FOUND);
    });

    // =========================
    // UPDATE INVENTORY
    // =========================

    it("should update inventory", async () => {

        const response = await request(app)
            .patch(`${apiEndPoint}/${inventoryId}`)
            .send({
                quantity: 200,
                reservedQuantity: 25,
                allowBackorder: true,
                lowStockAlert: 30,
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        expect(response.body.data.id).toBe(inventoryId);
        expect(response.body.data.variantId).toBe(variantId);
        expect(response.body.data.quantity).toBe(200);
        expect(response.body.data.reservedQuantity).toBe(25);
        expect(response.body.data.allowBackorder).toBe(true);
        expect(response.body.data.lowStockAlert).toBe(30);
    });

    // ==============================================
    // REJECT UPDATE FOR RESERVED EXCEEDS QUANTITY
    // ==============================================

    it("should reject update when reserved quantity exceeds quantity", async () => {

        const response = await request(app)
            .patch(`${apiEndPoint}/${inventoryId}`)
            .send({
                quantity: 20,
                reservedQuantity: 30,
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);

        expect(response.body.message).toBe(INVENTORY_ERRORS.RESERVED_QUANTITY_EXCEEDS_STOCK);
    });

    // =========================
    // UPDATE NEGATIVE QUANTITY
    // =========================

    it("should reject negative quantity", async () => {

        const response = await request(app)
            .patch(`${apiEndPoint}/${inventoryId}`)
            .send({
                quantity: -10,
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    // ==================================
    // UPDATE NEGATIVE RESERVED QUANTITY
    // ==================================

    it("should reject negative reserved quantity", async () => {

        const response = await request(app)
            .patch(`${apiEndPoint}/${inventoryId}`)
            .send({
                reservedQuantity: -5,
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    // ================================
    // UPDATE NEGATIVE LOW STOCK ALERT
    // ================================

    it("should reject negative low stock alert", async () => {

        const response = await request(app)
            .patch(`${apiEndPoint}/${inventoryId}`)
            .send({
                lowStockAlert: -5,
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    // =========================
    // GET UPDATED INVENTORY
    // =========================

    it("should return updated inventory", async () => {

        const response = await request(app)
            .get(`${apiEndPoint}/${inventoryId}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        expect(response.body.data.id).toBe(inventoryId);
        expect(response.body.data.quantity).toBe(200);
        expect(response.body.data.reservedQuantity).toBe(25);
        expect(response.body.data.allowBackorder).toBe(true);
        expect(response.body.data.lowStockAlert).toBe(30);
    });

    // =========================
    // DELETE INVENTORY
    // =========================

    it("should delete inventory", async () => {

        const response = await request(app)
            .delete(`${apiEndPoint}/${inventoryId}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        expect(response.body.message).toBe(INVENTORY_MESSAGES.INVENTORY_DELETED);
    });

    // =========================
    // VERIFY DELETION
    // =========================

    it("should return 404 after inventory deletion", async () => {

        const response = await request(app)
            .get(`${apiEndPoint}/${inventoryId}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);

        expect(response.body.message).toBe(INVENTORY_ERRORS.INVENTORY_NOT_FOUND);
    });

    // =========================
    // VERIFY DATABASE DELETION
    // =========================

    it("should remove inventory from database", async () => {

        const inventory = await prisma.inventory.findUnique({
            where: {
                id: inventoryId,
            },
        });

        expect(inventory).toBeNull();
    });
});