import { Router } from "express";
import { connection } from "../database/database.js";

import { ComparePassword, HashedPassword } from "../utils/helper.js";
import { SendMail } from "../utils/SendMail.js";
import * as crypto from "crypto"; //generates tokens

const user = Router();


function generateTempPassword(length = 12) {    //forgot password
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+<>?";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  return password;
}

function generateRandomCode() {
  return Math.floor(100000 + Math.random() * 900000); //generate 6-digit code
}


user.post("/", (req, res) => {  //create account process
  const { firstName, lastName, email, password } = req.body;

  //check if email already exists
  connection.execute(
    "SELECT * FROM userdata WHERE Email=?",
    [email],
    function (err, result) {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }

      if (result.length > 0) {
        //email already exists
        return res.status(409).json({ message: "Email already exists" });
      }

      //create new account
      const hashedPassword = HashedPassword(password);
      const verificationToken = crypto.randomBytes(32).toString("hex"); //generates unique token


      connection.execute(
        "INSERT INTO userdata (First_Name, Last_Name, Email, Password, isVerified, VerificationToken) VALUES (?, ?, ?, ?, ?, ?)",
        [firstName, lastName, email, hashedPassword, 0, verificationToken],
        function (err, result) {
          if (err) {
            return res.status(500).json({ message: "Server error" });
          }
          //swap between remote and local deployment
          const verificationLink = `http://localhost:8080/user/verify?token=${verificationToken}`;
          SendMail(email, "Archer Advising Email Verification", `Please verify your account by clicking this link: ${verificationLink}`);

          return res.status(200).json({ message: "Account created successfully, please verify account using email link" });
        }
      );
    }
  );
});

user.get("/verify", async (req, res) => {
  console.log("Verification route accessed");

  const { token } = req.query;
  console.log("Received token:", token);

  if (!token) {
    console.log("No token provided");
    return res.status(400).json({ message: "Verification token is missing" });
  }

  //check if the token exists in the database
  connection.execute(
    "SELECT * FROM userdata WHERE verificationToken=?",
    [token],
    function (err, result) {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (result.length === 0) {
        console.log("Token not found in database.");
        return res.status(400).json({ message: "Invalid or expired verification link" });
      }

      //debugging
      console.log("Token found, updating isVerified status...");

      //update isVerified to 1 and remove token to prevent reuse
      connection.execute(
        "UPDATE userdata SET isVerified=1, verificationToken=NULL WHERE verificationToken=?",
        [token],
        function (err, updateResult) {
          if (err) {
            console.error("Update error:", err);
            return res.status(500).json({ message: "Server error during update" });
          }

          if (updateResult.affectedRows === 0) {
            console.log("No rows updated, something went wrong.");
            return res.status(500).json({ message: "Verification failed" });
          }

          console.log("Log - Account Verified.");
          return res.status(200).json({ message: "Account verified successfully, you may close this window" });
        }
      );
    }
  );
});


user.delete("/:id", (req, res) => {
  connection.execute(
    "delete from userdata where id=?",
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
    "update userdata set First_Name=? , Last_Name=? where id=?",
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

user.get("/:id", (req, res) => {
  connection.execute(
    "select * from userdata where id=?",
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

user.post("/login", (req, res) => { //login and 2FA process
  connection.execute(
    "select * from userdata where email=?",
    [req.body.email],
    function (err, result) {
      if (err) {
        res.json({ status: 500, message: err.message });
      } else if (result.length === 0) { //checks if user exists
        res.json({ status: 401, message: "Invalid credentials" });
      } else {
        //check if user is verified
        if (result[0].isVerified === 0) {
          res.json({ status: 403, message: "Please verify your email before logging in." });
        } else {

          console.log(result[0].Password);


          if (ComparePassword(req.body.Password, result[0].Password)) { //if passwords match...
            const Code2FA = generateRandomCode(); //generate 2FA code
            const Code2FAExpires = Date.now() + 5 * 60 * 1000;  //create expiration of 2FA code

            connection.execute(
              'UPDATE userdata SET Code2FA=?, Code2FAExpires=? WHERE email=?',
              [Code2FA, Code2FAExpires, req.body.email],
              (err) => {
                if (err) {
                  return res.status(500).json({ message: 'Error saving 2FA code' });
                }


                //send the 2FA code by email
                SendMail(req.body.email, 'Archer Advising 2FA Code', `Your 2FA code is: ${Code2FA}`);
                /* res.status(200).json({ message: '2FA code sent to your email' }); */
              }
            );

            res.json({
              status: 200,
              message: "User sent 2FA Code",
              data: result,
            });
          } else {
            res.json({ status: 401, message: "Invalid password" });
          }
        }
      }
    }
  );
});

user.post("/change-password", (req, res) => {
  //select the user based on email
  connection.execute(
    "select * from userdata where email=?",
    [req.body.email],
    function (err, result) {
      if (err) {
        res.json({
          status: 500,
          message: err.message,
        });
      } else if (result.length === 0) {
        //user not found
        res.json({
          status: 404,
          message: "User not found.",
        });
      } else {
        //verify current password
        const user = result[0];
        if (ComparePassword(req.body.currentPassword, user.Password)) {
          //hash new password
          const newHashedPassword = HashedPassword(req.body.newPassword);

          //update password in the database
          connection.execute(
            "update userdata set Password=? where email=?",
            [newHashedPassword, req.body.email],
            function (updateErr, updateResult) {
              if (updateErr) {
                res.json({
                  status: 500,
                  message: updateErr.message,
                });
              } else {
                //respond with success message
                res.json({
                  status: 200,
                  message: "Password changed successfully.",
                  data: updateResult,
                });
              }
            }
          );
        } else {
          //invalid current password
          res.json({
            status: 401,
            message: "Invalid current password.",
          });
        }
      }
    }
  );
});

user.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  //check if email exists
  connection.execute("SELECT * FROM userdata WHERE email=?", [email], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error retrieving user" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result[0];

    //generate random temporary password
    const tempPassword = generateTempPassword(12);  //generate 12-character password
    const hashedTempPassword = HashedPassword(tempPassword);  //hash the temporary password

    //update user's password in the database with hashed temporary password
    connection.execute(
      "UPDATE userdata SET Password=? WHERE email=?",
      [hashedTempPassword, email],
      (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ message: "Error updating password" });
        }

        //send temporary password to user's email
        SendMail(email, "Temporary Password", `Your new temporary password is: ${tempPassword}`);

        return res.status(200).json({ message: "Password reset link has been sent to your email." });
      });
  }
  );
});

user.post('/verify-code', (req, res) => {
  const { email, Code2FA } = req.body;

  connection.execute(
    'SELECT Code2FA, Code2FAExpires FROM userdata WHERE email=?',
    [email],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Server error' });

      if (result.length === 0) return res.status(401).json({ message: 'User not found' });

      const user = result[0];

      //check if 2FA code is valid and not expired
      if (user.Code2FA !== parseInt(Code2FA, 10)) {
        return res.status(401).json({ message: 'Invalid 2FA code' });
      }

      if (Date.now() > user.Code2FAExpires) {
        return res.status(401).json({ message: '2FA code expired' });
      }

      //clear the 2FA code after successful verification
      connection.execute(
        'UPDATE userdata SET Code2FA=NULL, Code2FAExpires=NULL WHERE email=?',
        [email],
        (err) => {
          if (err) return res.status(500).json({ message: 'Error clearing 2FA code' });

          res.status(200).json({ message: 'Login successful' });
        }
      );
    }
  );
});

user.put('/change-info', async (req, res) => {
  const { email, firstName, lastName } = req.body;

  try {
    const [result] = connection.execute(
      'UPDATE userdata SET First_Name=?, Last_Name=? WHERE Email=?',
      [firstName, lastName, email]
    );
    console.log("Update result:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Information updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


user.post("/change-info", (req, res) => {
  //select the user based on email
  connection.execute(
    "select * from userdata where email=?",
    [req.body.email],
    function (err, result) {
      if (err) {
        res.json({
          status: 500,
          message: err.message,
        });
      } else if (result.length === 0) {
        //if user not found
        res.json({
          status: 404,
          message: "User not found.",
        });
      } else {
        //update the name in database
        connection.execute(
          "update userdata set First_Name=?, Last_Name=? where email=?",
          [req.body.firstName, req.body.lastName, req.body.email],
          function (updateErr, updateResult) {
            if (updateErr) {
              res.json({
                status: 500,
                message: updateErr.message,
              });
            } else {
              //respond with success message
              res.json({
                status: 200,
                message: "Name changed successfully.",
                data: updateResult,
              });
            }
          }
        );
      }
    });
}


);


export default user;