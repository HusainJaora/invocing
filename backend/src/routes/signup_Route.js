import express from "express";
import { signupValidation, validateDuplicateUser ,updateUserValidation} from "../middleware/signup_validation.js";
import  {create_user,get_all_users,get_User_ById,delete_user,update_user}  from "../controllers/signup_controller.js";

import ensureAuthenticated from "../middleware/authToken.js";


const router = express.Router();

// Add user
router.post("/signup",ensureAuthenticated,signupValidation,validateDuplicateUser,create_user);

// Get all users
router.get("/",ensureAuthenticated,get_all_users);

// Get user by ID
router.get("/:user_id", ensureAuthenticated,get_User_ById);

// Delete User
router.put("/deleteUser/:user_id",ensureAuthenticated,delete_user);

router.put("/updateUser/:user_id",ensureAuthenticated,updateUserValidation,update_user);



export default router;
