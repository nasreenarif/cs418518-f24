import { Router } from "express";
import { connection } from "../database/database.js";
import { ComparePasword, HashedPassword } from "../utils/helper.js";
import { SendMail } from "../utils/SendMail.js";
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

user.post("/", (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Check if email already exists
  connection.execute(
    "SELECT * FROM userdata WHERE Email=?",
    [email],
    function (err, result) {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }

      if (result.length > 0) {
        // Email already exists
        return res.status(409).json({ message: "Email already exists" });
      }

      // Create new account
      const hashedPassword = HashedPassword(password);
      connection.execute(
        "INSERT INTO userdata (First_Name, Last_Name, Email, Password) VALUES (?, ?, ?, ?)",
        [firstName, lastName, email, hashedPassword],
        function (err, result) {
          if (err) {
            return res.status(500).json({ message: "Server error" });
          }
          return res.status(200).json({ message: "Account created successfully" });
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

user.post("/change-password", (req, res) => {
  // Step 1: Select the user based on email
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
        // User not found
        res.json({
          status: 404,
          message: "User not found.",
        });
      } else {
        // Step 2: Verify the current password
        const user = result[0];
        if (ComparePasword(req.body.currentPassword, user.Password)) {
          // Step 3: Hash the new password
          const newHashedPassword = HashedPassword(req.body.newPassword);

          // Step 4: Update the password in the database
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
                // Step 5: Respond with success message
                res.json({
                  status: 200,
                  message: "Password changed successfully.",
                  data: updateResult,
                });
              }
            }
          );
        } else {
          // Invalid current password
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

  // Check if the email exists
  connection.execute("SELECT * FROM userdata WHERE email=?", [email], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error retrieving user" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result[0];

    // Generate a random temporary password
    const tempPassword = generateTempPassword(12);  // Generates a 12-character password
    const hashedTempPassword = HashedPassword(tempPassword);  // Hash the temporary password

    // Update the user's password in the database with the hashed temporary password
    connection.execute(
      "UPDATE userdata SET Password=? WHERE email=?",
      [hashedTempPassword, email],
      (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ message: "Error updating password" });
        }

        // Send the temporary password to the user's email
        SendMail(email, "Temporary Password", `Your new temporary password is: ${tempPassword}`);

        return res.status(200).json({ message: "Password reset link has been sent to your email." });
      });
  }
  );
});

user.put("/change-info", (req, res) => {
  const { email, firstName, lastName } = req.body;

  // Check if all required fields are provided
  if (!email || !firstName || !lastName) {
    return res.status(400).json({ message: "Please provide all required fields: current email, new first name, and new last name." });
  }

  // Step 1: Check if the provided email exists in the database
  connection.execute(
    "SELECT * FROM userdata WHERE Email = ?",
    [email],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err.message });
      }

      if (results.length === 0) {
        // If no user with the provided email is found
        return res.status(404).json({ message: "No user found with the provided email." });
      }
      else {
        // Step 2: Update the user's first name and last name if the email exists
        connection.execute(
          "UPDATE userdata SET First_Name = ?, Last_Name = ? WHERE Email = ?",
          [firstName, lastName, email],  // Ensure the WHERE clause matches the specific email
          (updateErr, updateResult) => {
            if (updateErr) {
              return res.status(500).json({ message: "Failed to update user information", error: updateErr.message });
            }
            if (updateResult.affectedRows === 0) {
              return res.status(404).json({ message: "No user found with the provided email to update." });
            }
            else {
              return res.status(200).json({ message: "User information updated successfully!" });
            }
          }
        );
      }
    }
  );
});

export default user;