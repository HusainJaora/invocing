import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import signupRoute from './routes/signup_Route.js';
import loginRoute from './routes/login_Route.js';
import customerRoute from './routes/customer_Route.js';
import productRoute from './routes/product_Route.js';
import invoiceRoute from './routes/invoice_Route.js';


import cookieParser from 'cookie-parser';



dotenv.config();
const app = express();


app.use(cors()); 


app.use(helmet());
app.use(express.json());
app.use(cookieParser());


app.use("/user", signupRoute);
app.use("/login", loginRoute);

app.use("/customer", customerRoute);

app.use("/product", productRoute);

app.use("/invoice",invoiceRoute)



const PORT = process.env.PORT;
app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));
