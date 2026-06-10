import express from 'express';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import dbConnection from './config/db.js';
import { router } from "./routes/userRoute.js";
import projectRouter from './routes/projectRoute.js';
import bidRouter from './routes/bidRoute.js';


const port = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", router);
app.use("/api/projects", projectRouter);
app.use("/api/bids", bidRouter);

app.get('/', (req, res) => {
    res.send("hello");
})

dbConnection();

app.listen(port, (req, res) => {
    console.log(`server is listening at ${port}`);
})
