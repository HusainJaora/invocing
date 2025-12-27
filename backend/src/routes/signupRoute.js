import express from "express";
import { signupValidation, validateDuplicateUser ,updateUserValidation} from "../middleware/signup_validation.js";
import  {create_user,get_all_users,get_User_ById,delete_user,update_user}  from "../controllers/signup_controller.js";

const router = express.Router();

// Add user
router.post("/signup",signupValidation,validateDuplicateUser,create_user);

// Get all users
router.get("/users",get_all_users);

// Get user by ID
router.get("/users/:user_id", get_User_ById);

// Delete User
router.put("/deleteUser/:user_id",delete_user);

router.put("/updateUser/:user_id",updateUserValidation,update_user);



export default router;
