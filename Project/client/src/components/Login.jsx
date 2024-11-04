import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
/* import "../styles/loginStyle.css" */


export default function Login() {
    const [enteredEmail, setEnteredEmail] = useState("");
    const [enteredPassword, setEnteredPassword] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [Code2FA, setCode2FA] = useState("");
    const [is2FARequired, setIs2FARequired] = useState(false);
    const [errorMessage, setErrorMessage] = useState(''); // For error messages
    const [userStateVal, setUserStateVal] = useState(true);
    const navigate = useNavigate();
    // const [message, setMessage] = useState("");

    function handleInputChange(identifier, value) {
        if (identifier === "email") {
            setEnteredEmail(value);
        } else if (identifier === "password") {
            setEnteredPassword(value);
        } else if (identifier === "Code2FA") {
            setCode2FA(value);
        }
    }

    const handleLogin = async (event) => {
        event.preventDefault();
        setSubmitted(true);

        try {
            const formBody = JSON.stringify({
                email: enteredEmail,
                Password: enteredPassword
            })

            const response = await fetch('http://localhost:8080/user/login', {
                method: "POST",
                body: formBody,
                headers: {
                    'content-type': 'application/json'
                }
            });


            const data = await response.json();
            console.log('Fetched user data:', data); // Log the fetched data

            if (!response.ok) {
                console.log('response not ok');
                throw new Error('Login failed'); // Handle HTTP errors
            }

            if (response.ok) {
                console.log('response is ok');
                if (data.message == "Please verify your email before logging in.") {
                    setErrorMessage('Please verify email.');
                    alert('Something went wrong. Check if you have verified your email.');
                }

                //code for 'login is successful'
                else if (data.data.length > 0) {

                    setIs2FARequired(true); // Show the 2FA input field
                    console.log('set 2FA required as TRUE');
                    setErrorMessage("A 2FA code has been sent to your email. Please enter it below.");

                    setErrorMessage('');    //clears error message
                    setUserStateVal(1);

                    localStorage.setItem('storedEmail', JSON.stringify(enteredEmail));
                    /* console.log("userStateVal = " + userStateVal); */

                    /* navigate('/dashboard');     //placed inside IF */

                }/*  else {
                    // Show error message if login fails
                    setErrorMessage('Invalid credentials. Please try again.');
                    alert('Something went wrong. Check if you have verified your email.');
                } */
                /* if (data.data.isVerified == 0) {
                    setErrorMessage('Please verify email before logging in.');
                    alert('Please verify email before logging in.');
                } */


            }
        }
        catch (error) {
            setErrorMessage(error.message);
            alert(error.message);
        }
    }

    const handleVerify2FA = async (event) => {
        event.preventDefault();

        try {
            const formBody = JSON.stringify({
                email: enteredEmail,
                Code2FA: Code2FA
            });

            const response = await fetch('http://localhost:8080/user/verify-code', {
                method: "POST",
                body: formBody,
                headers: {
                    'content-type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert("Login successful");
                navigate('/dashboard');
            } else {
                setErrorMessage(data.message || '2FA verification failed');
            }

        } catch (error) {
            setErrorMessage(error.message);
        }
    };


    const emailNotValid = submitted && !enteredEmail.includes("@");
    const passwordNotValid = submitted && enteredPassword.trim().length < 6;

    return (
        <div>
            <header style={{ backgroundColor: "#00539C", color: "#fff", padding: "20px", textAlign: "center" }}>
                <h1 style={styles.headerTitle}>Welcome to Archer Advising</h1>
                <p>CS418 Web Programming Fall 2024</p>
            </header>

            <div id="login" style={styles.loginContainer}>
                <h2>Login</h2>
                {!is2FARequired ? (
                    <form onSubmit={handleLogin} style={styles.form}>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            required
                            className={emailNotValid ? "invalid" : ""}
                            onChange={(event) => handleInputChange("email", event.target.value)}
                            style={styles.input}
                        />

                        <label htmlFor="Password">Password:</label>
                        <input
                            type="password"
                            id="Password"
                            name="Password"
                            placeholder="Enter your Password"
                            required
                            className={passwordNotValid ? "invalid" : ""}
                            onChange={(event) => handleInputChange("password", event.target.value)}
                            style={styles.input}
                        />

                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

                        <div className="actions" style={styles.actions}>
                            <button className="button" style={styles.button} type="submit">
                                Sign In
                            </button>
                        </div>
                    </form>
                ) : (
                    // --------------------------just below here is 2FA form----------------------------------------------------------------------------
                    <form onSubmit={handleVerify2FA} style={styles.form}>
                        <label htmlFor="Code2FA">Enter 2FA Code:</label>
                        <input
                            type="text"
                            id="Code2FA"
                            name="Code2FA"
                            placeholder="Enter the 2FA code sent to your email"
                            required
                            onChange={(event) => handleInputChange("Code2FA", event.target.value)}
                            style={styles.input}
                        />

                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

                        <div className="actions" style={styles.actions}>
                            <button className="button" style={styles.button} type="submit">
                                Verify 2FA Code
                            </button>
                        </div>
                    </form>

                )}
                <div className="create-account" style={styles.createAccount}>
                    <div style={styles.createAccount}>
                        <p>
                            Don't have an account? <a href="/create-account">Create Account</a>
                        </p>
                    </div>
                </div>
                <div className="extra-options" style={styles.extraOptions}>
                    <div style={styles.forgotPassword}>
                        <a href="/forgot-password">Forgot your password?</a>
                    </div>
                </div>
            </div>
        </div >
    );
};



const styles = {
    loginContainer: {
        backgroundColor: "#fff",
        padding: "30px",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        width: "300px",
        margin: "auto",
        marginTop: "50px",
    },
    headerTitle: {
        fontFamily: "Georgia, serif",
        fontSize: "28px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
    },
    input: {
        padding: "10px",
        marginTop: "5px",
        fontSize: "16px",
        border: "1px solid #ccc",
        borderRadius: "4px",
    },
    actions: {
        marginTop: "20px",
        display: "flex",
        justifyContent: "space-between",
    },
    button: {
        padding: "10px",
        fontSize: "16px",
        backgroundColor: "#00539C",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },
    textButton: {
        backgroundColor: "transparent",
        border: "none",
        color: "#00539C",
        cursor: "pointer",
    },
    createAccount: {
        textAlign: "center",
        marginTop: "20px",
    },
    extraOptions: {
        textAlign: "center",
        marginTop: "15px",
    },
    forgotPassword: {
        marginTop: '10px',
        textAlign: 'center',
    },
};