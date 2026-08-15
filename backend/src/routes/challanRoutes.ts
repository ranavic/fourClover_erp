import { Router } from "express";
import { createChallan, getChallans, getChallanById, updateChallanStatus, generateInvoice } from "../controllers/challanController";



import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticate, authorize("ADMIN", "SALES"), createChallan);
router.get("/", authenticate, authorize("ADMIN", "SALES", "ACCOUNTS", "WAREHOUSE"), getChallans);
router.get("/:id", authenticate, authorize("ADMIN", "SALES", "ACCOUNTS", "WAREHOUSE"), getChallanById);
router.put("/:id/status", authenticate, authorize("ADMIN", "SALES"), updateChallanStatus);
router.get("/:id/invoice", authenticate, authorize("ADMIN", "SALES", "ACCOUNTS"), generateInvoice);

export default router;
