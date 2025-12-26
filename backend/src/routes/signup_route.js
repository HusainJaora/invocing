import express from "express";
import { signupValidation, validateDuplicateUser } from "../middleware/signup_validation.js";
import  {create_user}  from "../controllers/signup_controller.js";

const router = express.Router();

router.post(
    "/signup",
    signupValidation,
    validateDuplicateUser,
    create_user
);



export default router;
