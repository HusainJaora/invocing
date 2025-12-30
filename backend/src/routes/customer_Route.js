import express from 'express';
import {addCustomer, getAllcustomer,get_Customer_ById, delete_customer,updateCustomer} from "../controllers/customer_controller.js";
import ensureAuthenticated from "../middleware/authToken.js"; 
import { addCustomerValidation, updateCustomerValidation } from '../middleware/customer_validation.js'; 

const router = express.Router();

// Add customer
router.post("/add", ensureAuthenticated, addCustomerValidation, addCustomer);

// Get all customers
router.get("/", ensureAuthenticated, getAllcustomer);

router.get("/:customer_id", ensureAuthenticated, get_Customer_ById);

// Delete customer
router.put("/deleteCustomer/:customer_id", ensureAuthenticated, delete_customer);

router.put("/updateCustomer/:customer_id", ensureAuthenticated, updateCustomerValidation, updateCustomer);


export default router;