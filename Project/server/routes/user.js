import { Router } from "express";
import { connection } from "../database/database.js";
import { ComparePasword, HashedPassword } from "../utils/helper.js";
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
});

user.get("/:id", (req, res) => {
  connection.execute(
    "select * from user_information where user_id=?",
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
    "Insert into user_information (First_Name,Last_Name,Email,Password) values(?,?,?,?)",
    [req.body.firstName, req.body.lastName, req.body.email, hashedPassword],
    function (err, result) {
      if (err) {
        res.json(err.message);
      } else {
        res.json({
          status: 200,
          message: "Response from user post api",
          data: result,
        });
      }
    }
  );
});


user.delete("/:id", (req, res) => {
  connection.execute(
    "delete from user_information where user_id=?",
    [req.params.id],
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


user.put("/:id", (req, res) => {
  connection.execute(
    "update user_information set First_Name=? , Last_Name=? where user_id=?",
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
    "select * from user_information where email=?",
    [req.body.email],
    function (err, result) {
      if (err) {
        res.json(err.message);
      } else {
        console.log(result[0].PASSWORD);
        if (ComparePasword(req.body.password, result[0].PASSWORD)) {

          // SendMail(req.body.email,"Login Verification","Your login verification is 1234567")

          res.json({
            status: 200,
            message: "user logged in successfully",
            data: result[0],
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
