import { Router } from "express";
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    addStockMovement,
    getStockMovements
} from "../controllers/productController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

// List all products
router.get(
    "/",
    authenticate,
    authorize("ADMIN", "WAREHOUSE", "SALES", "ACCOUNTS"),
    getProducts
);

// Global stock movements log
router.get(
    "/movements",
    authenticate,
    authorize("ADMIN", "WAREHOUSE", "SALES", "ACCOUNTS"),
    getStockMovements
);

// Get single product details
router.get(
    "/:id",
    authenticate,
    authorize("ADMIN", "WAREHOUSE", "SALES", "ACCOUNTS"),
    getProductById
);

// Add product
router.post(
    "/",
    authenticate,
    authorize("ADMIN", "WAREHOUSE"),
    createProduct
);

// Edit product
router.put(
    "/:id",
    authenticate,
    authorize("ADMIN", "WAREHOUSE"),
    updateProduct
);

// Add stock movement (IN / OUT)
router.post(
    "/:id/movements",
    authenticate,
    authorize("ADMIN", "WAREHOUSE"),
    addStockMovement
);

// Stock movements log for single product
router.get(
    "/:id/movements",
    authenticate,
    authorize("ADMIN", "WAREHOUSE", "SALES", "ACCOUNTS"),
    getStockMovements
);

export default router;