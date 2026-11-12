
import express from "express";

import {
  getProfile,
  updateProfile,
} from "../controllers/userController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// All profile routes require authentication
router.use(protect);

// Get logged-in user's profile
router.get("/profile", getProfile);

// Update logged-in user's profile
router.put("/profile", updateProfile);

export default router;
