// console.log('Hello from node application');

import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import session from "express-session";
import dashboard from "./routes/dashboard.js";
import user from "./routes/user.js";
const app=express();
const port=8080;

const myLogger=function(req,res,next){
    console.log('Calling Api');
    next()
    console.log('Api calling has done');
}

app.use(myLogger);
app.use(bodyParser.json());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}))


app.use(session({
    secret:"secret123",
    saveUninitialized:true,
    resave:false,
    cookie:{
        secure:false,
        httpOnly:true,
        maxAge:3600000
    }
}))


app.use('/user',user);
app.use('/dashboard',dashboard);



app.listen(port,()=>{
    console.log(`Server is running at port ${port}`);
});

export default app;