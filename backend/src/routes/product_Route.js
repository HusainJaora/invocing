import express from 'express';
import {add_Product, get_Allproduct, get_Product_ById, delete_Product, update_Product } from "../controllers/product_controller.js";
import ensureAuthenticated from "../middleware/authToken.js"; 
import { addProductValidation, updateProductValidation } from '../middleware/product_validation.js';


const router = express.Router();

router.post('/add', ensureAuthenticated, addProductValidation, add_Product);

router.get('/', ensureAuthenticated, get_Allproduct);

router.get('/:product_id', ensureAuthenticated, get_Product_ById);

router.put('/deleteProduct/:product_id', ensureAuthenticated, delete_Product);

router.put('/:product_id', ensureAuthenticated, updateProductValidation, update_Product);

export default router;
