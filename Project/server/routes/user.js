import { Router } from "express";
import { connection } from "../database/database.js";
import { ComparePasword, HashedPassword } from "../utils/helper.js";
import { SendMail } from "../utils/SendMail.js";
const user = Router();

user.get("/", (req, res) => {
  connection.execute("select * from userdata", function (err, result) {
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
});

user.get("/:id", (req, res) => {
  connection.execute(
    "select * from userdata where user_id=?",
    [req.params.id],
    function (err, result) {
      if (err) {
        res.json(err.message);
      } else {
        res.json({
          status: 200,
          message: "Response from user get api",
          data: result,
        });
      }
    }
  );
});

user.post("/", (req, res) => {

  const hashedPassword = HashedPassword(req.body.password)

  connection.execute(
    "Insert into userdata (First_Name,Last_Name,Email,Password) values(?,?,?,?)",
    [req.body.firstName, req.body.lastName, req.body.email, hashedPassword],
    function (err, result) {
      if (err) {
        res.json(err.message);
      } else {
        res.json({
          status: 200,
          message: "Repsonse from POST API, attempting add user",
          data: result,
        });
      }
    }
  );
});


user.delete("/:id", (req, res) => {
  connection.execute(
    "delete from userdata where user_id=?",
    [req.params.id],
    function (err, result) {
      if (err) {
        res.json(err.message);
      } else {
        res.json({
          status: 200,
          message: "Response from DELETE API, attempting user delete",
          data: result,
        });
      }
    }
  );
});


user.put("/:id", (req, res) => {
  connection.execute(
    "update userdata set First_Name=? , Last_Name=? where user_id=?",
    [req.body.firstName,
    req.body.lastName,
    req.params.id],
    function (err, result) {
      if (err) {
        res.json(err.message);
      } else {
        res.json({
          status: 200,
          message: "Response from user delete api",
          data: result,
        });
      }
    }
  );
});


user.post("/login", (req, res) => {
  connection.execute(
    "select * from userdata where email=?",
    [req.body.email],
    function (err, result) {
      if (err) {
        res.json(err.message);
      } else if (result.length === 0) {
        res.json("Credentials Invalid user.js");  //change JOIN to JSON
      }
      else {
        console.log(result[0].Password);
        if (ComparePasword(req.body.Password, result[0].Password)) {

          SendMail(req.body.email, "Login Verification", "Your login verification is 1234567")

          res.json({
            status: 200,
            message: "user logged in successfully",
            data: result,
          });
        }
        else {
          res.json("Invalid Password");
        }

      }
    }
  );
});

export default user;
