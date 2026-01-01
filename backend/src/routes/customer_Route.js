import express from 'express';
import {add_Customer, get_Allcustomer,get_Customer_ById, delete_customer,update_Customer} from "../controllers/customer_controller.js";
import ensureAuthenticated from "../middleware/authToken.js"; 
import { addCustomerValidation, updateCustomerValidation } from '../middleware/customer_validation.js'; 

const router = express.Router();

// Add customer
router.post("/add", ensureAuthenticated, addCustomerValidation, add_Customer);

// Get all customers
router.get("/", ensureAuthenticated, get_Allcustomer);

router.get("/:customer_id", ensureAuthenticated, get_Customer_ById);

// Delete customer
router.put("/deleteCustomer/:customer_id", ensureAuthenticated, delete_customer);

router.put("/updateCustomer/:customer_id", ensureAuthenticated, updateCustomerValidation, update_Customer);


export default router;