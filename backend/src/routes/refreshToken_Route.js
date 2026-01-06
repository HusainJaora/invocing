import express from 'express';
import  refreshAccessToken  from "../controllers/refresh_Access_Token_Controller.js";
import ensureAuthenticated from "../middleware/authToken.js";



const router = express.Router();

router.post('/', ensureAuthenticated, refreshAccessToken);

export default router;