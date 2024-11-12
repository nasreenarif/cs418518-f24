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

//create account
user.post("/", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // Check if email already exists
    const [existingUser] = await connection.execute(
      "SELECT * FROM userdata WHERE Email=?",
      [email]
    );

    if (existingUser.length > 0) {
      // Email already exists
      return res.status(409).json({ message: "Email already exists" });
    }

    // Create new account
    const hashedPassword = HashedPassword(password);
    const verificationToken = crypto.randomBytes(32).toString("hex"); // Generates a unique token

    // Insert new user data
    await connection.execute(
      "INSERT INTO userdata (First_Name, Last_Name, Email, Password, isVerified, VerificationToken) VALUES (?, ?, ?, ?, ?, ?)",
      [firstName, lastName, email, hashedPassword, 0, verificationToken]
    );

    // Generate verification link
    const verificationLink = `http://localhost:8080/user/verify?token=${verificationToken}`;

    // Send verification email
    await SendMail(email, "Archer Advising Email Verification", `Please verify your account by clicking this link: ${verificationLink}`);

    return res.status(200).json({ message: "Account created successfully, please verify account using email link" });
  } catch (error) {
    console.error("Error creating account:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

user.get("/verify", async (req, res) => {
  console.log("Verification route accessed");

  const { token } = req.query;
  console.log("Received token:", token);

  if (!token) {
    console.log("No token provided");
    return res.status(400).json({ message: "Verification token is missing" });
  }

  try {
    // Check if the token exists in the database
    const [rows] = await connection.execute(
      "SELECT * FROM userdata WHERE verificationToken = ?",
      [token]
    );

    if (rows.length === 0) {
      console.log("Token not found in database.");
      return res.status(400).json({ message: "Invalid or expired verification link" });
    }

    console.log("Token found, updating isVerified status...");

    // Update isVerified to 1 and remove token to prevent reuse
    const [updateResult] = await connection.execute(
      "UPDATE userdata SET isVerified = 1, verificationToken = NULL WHERE verificationToken = ?",
      [token]
    );

    if (updateResult.affectedRows === 0) {
      console.log("No rows updated, something went wrong.");
      return res.status(500).json({ message: "Verification failed" });
    }

    console.log("Account verified successfully.");
    return res.status(200).json({ message: "Account verified successfully, you may close this window" });
  } catch (error) {
    console.error("Error during verification:", error);
    return res.status(500).json({ message: "Server error" });
  }
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

user.post("/login", async (req, res) => {
  try {
    // Step 1: Query user by email
    const [rows] = await connection.execute(
      "SELECT * FROM userdata WHERE email = ?",
      [req.body.email]
    );

    // Step 2: Check if user exists
    if (rows.length === 0) {
      console.log("User not found for email:", req.body.email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    console.log("User found:", user);

    // Step 3: Check if user is verified
    if (user.isVerified === 0) {
      console.log("User not verified:", req.body.email);
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    // Step 4: Compare passwords
    const isPasswordValid = ComparePassword(req.body.Password, user.Password);
    if (!isPasswordValid) {
      console.log("Invalid password for user:", req.body.email);
      return res.status(401).json({ message: "Invalid password" });
    }

    // Step 5: Generate 2FA code and set expiration
    const Code2FA = generateRandomCode();
    const Code2FAExpires = Date.now() + 5 * 60 * 1000;
    console.log("Generated 2FA Code:", Code2FA);

    // Step 6: Save 2FA code and expiration to the database
    const [updateResult] = await connection.execute(
      "UPDATE userdata SET Code2FA = ?, Code2FAExpires = ? WHERE email = ?",
      [Code2FA, Code2FAExpires, req.body.email]
    );

    if (updateResult.affectedRows === 0) {
      console.log("Failed to update 2FA code for user:", req.body.email);
      return res.status(500).json({ message: "Error saving 2FA code" });
    }

    // Step 7: Send the 2FA code via email
    await SendMail(req.body.email, 'Archer Advising 2FA Code', `Your 2FA code is: ${Code2FA}`);
    console.log("2FA code sent to user:", req.body.email);

    // Step 8: Respond with success
    return res.status(200).json({
      message: "User sent 2FA Code",
      data: { email: req.body.email },
    });

  } catch (error) {
    console.error("Login process error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
});


user.post("/change-password", async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  // Check if all required fields are present
  if (!email || !currentPassword || !newPassword) {
    console.log("Missing fields in request");
    return res.status(400).json({ message: "Missing fields in request" });
  }

  try {
    // Step 1: Fetch the user by email
    const [rows] = await connection.execute(
      "SELECT * FROM userdata WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found." });
    }

    const user = rows[0];
    console.log("User found:", user);

    // Step 2: Verify the current password
    const isPasswordValid = ComparePassword(currentPassword, user.Password);
    if (!isPasswordValid) {
      console.log("Invalid current password");
      return res.status(401).json({ message: "Invalid current password." });
    }

    // Step 3: Hash the new password
    const newHashedPassword = HashedPassword(newPassword);
    console.log("New hashed password generated");

    // Step 4: Update the password in the database
    const [updateResult] = await connection.execute(
      "UPDATE userdata SET Password = ? WHERE email = ?",
      [newHashedPassword, email]
    );

    if (updateResult.affectedRows === 0) {
      console.log("Password update failed");
      return res.status(500).json({ message: "Password update failed" });
    }

    console.log("Password updated successfully");
    return res.status(200).json({ message: "Password changed successfully." });

  } catch (error) {
    console.error("Database error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});


user.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists
    const [rows] = await connection.execute("SELECT * FROM userdata WHERE email=?", [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    // Generate a random temporary password and hash it
    const tempPassword = generateTempPassword(12);
    const hashedTempPassword = HashedPassword(tempPassword);

    // Update the user's password in the database with the hashed temporary password
    await connection.execute(
      "UPDATE userdata SET Password=? WHERE email=?",
      [hashedTempPassword, email]
    );

    // Send the temporary password to the user's email
    await SendMail(email, "Temporary Password", `Your new temporary password is: ${tempPassword}`);

    return res.status(200).json({ message: "Password reset link has been sent to your email." });
  } catch (error) {
    console.error("Error during password reset:", error);
    return res.status(500).json({ message: "An error occurred. Please try again later." });
  }
});


user.post('/verify-code', async (req, res) => {
  const { email, Code2FA } = req.body;
  console.log("Verification request received for email:", email);
  console.log("Received 2FA Code:", Code2FA);

  try {
    const [result] = await connection.execute(
      'SELECT Code2FA, Code2FAExpires FROM userdata WHERE email=?',
      [email]
    );

    if (result.length === 0) {
      console.log("User not found");
      return res.status(401).json({ message: 'User not found' });
    }

    const user = result[0];
    console.log("Stored 2FA Code:", user.Code2FA);
    console.log("Stored 2FA Expiration:", user.Code2FAExpires);

    if (user.Code2FA !== parseInt(Code2FA, 10)) {
      console.log("Invalid 2FA code provided");
      return res.status(401).json({ message: 'Invalid 2FA code' });
    }

    if (Date.now() > user.Code2FAExpires) {
      console.log("2FA code expired");
      return res.status(401).json({ message: '2FA code expired' });
    }

    await connection.execute(
      'UPDATE userdata SET Code2FA=NULL, Code2FAExpires=NULL WHERE email=?',
      [email]
    );

    console.log("2FA verified successfully. Login successful.");
    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});


user.post('/change-info', async (req, res) => {
  const { email, firstName, lastName } = req.body;

  try {
    const [result] = await connection.execute(
      'UPDATE userdata SET First_Name = ?, Last_Name = ? WHERE Email = ?',
      [firstName, lastName, email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Information updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


user.put('/change-info', async (req, res) => {
  const { email, First_Name, Last_Name } = req.body;

  try {
    const [result] = await connection.execute(
      'UPDATE userdata SET First_Name = ?, Last_Name = ? WHERE Email = ?',
      [First_Name, Last_Name, email]
    );
    console.log("Update result:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Information updated successfully' });
  } catch (error) {
    console.error("Error during update:", error);
    res.status(500).json({ message: 'Server error' });
  }
});


export default user;