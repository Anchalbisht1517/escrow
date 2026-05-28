import express from 'express';
import 'dotenv/config';
import dbConnection  from './config/db.js';


const port=process.env.PORT||8000;
const app= express();

app.get('/',(req,res)=>{
    res.send("hello");
})

dbConnection();

app.listen(port,(req,res)=>{
    console.log(`server is listening at ${port}`);
})
