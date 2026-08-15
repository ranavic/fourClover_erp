import { Router } from "express";
import {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer
} from "../controllers/customerController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

router.post(
    "/",
    authenticate,
    authorize("ADMIN", "SALES"),
    createCustomer
);

router.get(
    "/",
    authenticate,
    authorize("ADMIN", "SALES"),
    getCustomers
);

router.get(
    "/:id",
    authenticate,
    authorize("ADMIN", "SALES"),
    getCustomerById
);

router.put(
    "/:id",
    authenticate,
    authorize("ADMIN", "SALES"),
    updateCustomer
);

export default router;
