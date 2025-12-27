import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import signupRoute from './routes/signupRoute.js';


dotenv.config();
const app = express();


app.use(cors()); 


app.use(helmet());
app.use(express.json());


app.use("/invoicing", signupRoute);



const PORT = process.env.PORT;
app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));
