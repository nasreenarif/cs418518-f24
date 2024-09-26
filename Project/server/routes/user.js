import { Router } from "express";
import { connection } from "../database/database.js";
const user = Router();

user.get("/", (req, res) => {
  connection.execute("select * from user_information", function (err, result) {
    if (err) {
      res.json(err.message);
    } else {
      res.json({
        status: 200,
        message: "Response from user get api",
        data: result,
      });
    }
  });

  // res.json({
  //     'status':200,
  //     'message':"Response from get api",
  //     'data':'Testing nodemon'
  // });
});

export default user;
