import { Router } from "express";
const dashboard=Router();


dashboard.get("/", (req, res) => {
 
    console.log(req.session)
    console.log(req.cookies)

    if(!req.session.user){
        res.json("Unauthorized user");
    }
    else
    {
        res.json("Authorized User");
    }


  });

export default dashboard;  