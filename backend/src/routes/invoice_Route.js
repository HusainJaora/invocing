import express from 'express';
import {add_Invoice,get_AllInvoice, get_Invoice_ById,delete_Invoice, update_Invoice} from "../controllers/invoice_controller.js"
import ensureAuthenticated from "../middleware/authToken.js"; 


const router = express.Router();

// Add invoice
router.post("/add", ensureAuthenticated, add_Invoice); 

// Get all invoices
router.get("/", ensureAuthenticated, get_AllInvoice);


// get_Invoice_ById
router.get("/:invoice_id", ensureAuthenticated, get_Invoice_ById);

// Delete invoice
 router.put("/deleteInvoice/:invoice_id", ensureAuthenticated, delete_Invoice);


// Update invoice
router.put("/updateInvoice/:invoice_id", ensureAuthenticated, update_Invoice);

export default router;