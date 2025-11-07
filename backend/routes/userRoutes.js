import express from "express";
const router = express.Router();
import {
  registerUser, loginUser, logoutUser, getUserProfile, updateUserProfile,
  getUsers, getUserById, updateUser, deleteUser 
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

// --- Public Routes ---
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// --- Private Routes (User) ---
router.route("/logout").post(protect, logoutUser); // protect might be enough
router.route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// --- Private Routes (Admin) ---
// GET /api/users
router.route('/')
  .get(protect, admin, getUsers);

// GET /api/users/:id
// PUT /api/users/:id
// DELETE /api/users/:id
router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router;