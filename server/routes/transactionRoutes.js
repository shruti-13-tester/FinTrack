
import express from "express";

import {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// All transaction routes require login
router.use(protect);

router.post("/", addTransaction);

router.get("/", getTransactions);

router.put("/:id", updateTransaction);

router.delete("/:id", deleteTransaction);

export default router;
