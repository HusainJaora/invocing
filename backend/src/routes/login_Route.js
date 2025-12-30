import express from "express";
import { loginValidation } from "../middleware/login_validation.js";
import { login } from "../controllers/login_controller.js";

const router = express.Router();

router.post("/", loginValidation, login);

export default router;
