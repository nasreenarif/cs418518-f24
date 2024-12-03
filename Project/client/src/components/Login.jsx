import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from "react-router-dom";

/* import "../styles/loginStyle.css" */



export default function Login() {
    const [enteredEmail, setEnteredEmail] = useState("");
    const [displayEmail, setDisplayEmail] = useState("");
    const [enteredPassword, setEnteredPassword] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [Code2FA, setCode2FA] = useState("");
    const [is2FARequired, setIs2FARequired] = useState(false);
    const [errorMessage, setErrorMessage] = useState(''); // For error messages
    const [userStateVal, setUserStateVal] = useState(true);
    const navigate = useNavigate();
    // const [message, setMessage] = useState("");

    useEffect(() => {
        // Check if the page is being loaded in an iframe
        if (window.self !== window.top) {
            document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: white;">
              <h1 style="color: red; font-family: Arial, sans-serif;">This content cannot be displayed in an iframe.</h1>
            </div>
          `;
            throw new Error("This content cannot be displayed in an iframe.");
        }
    }, []);

    function handleInputChange(identifier, value) {
        if (identifier === "email") {
            setEnteredEmail(value);
            setDisplayEmail(value); //syncs display email with saved email
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
            });

            const response = await fetch('http://localhost:8080/user/login', {
                method: "POST",
                body: formBody,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.log('Fetched user data:', data);

            // Check server response status directly
            if (response.status === 403) {
                setErrorMessage('Please verify your email before logging in.');
                return;
            }

            if (response.status === 401) {
                setErrorMessage('Invalid email or password. Please try again.');
                return;
            }

            // If 2FA code was sent successfully
            if (response.status === 200 && data.message === "User sent 2FA Code") {
                setIs2FARequired(true); // Show the 2FA input field
                setErrorMessage('');    // Clear any previous error message
                console.log("2FA required, waiting for code.");
            } else {
                setErrorMessage('Unexpected response from the server.');
            }
        } catch (error) {
            setErrorMessage('Login failed. Please check your credentials and try again.');
            console.error('Error during login:', error);
        }
    };



    const handleVerify2FA = async (event) => {
        event.preventDefault();
        console.log("Verify 2FA button clicked"); // Log for debugging

        try {
            const formBody = JSON.stringify({
                email: enteredEmail,
                Code2FA: Code2FA
            });

            const response = await fetch('http://localhost:8080/user/verify-code', {
                method: "POST",
                body: formBody,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.log("2FA verification response:", data); // Log response for debugging

            if (response.ok) {
                alert("Login successful");
                localStorage.setItem('storedEmail', JSON.stringify(enteredEmail)); // Store email after successful 2FA
                navigate('/dashboard');
            } else {
                setErrorMessage(data.message || '2FA verification failed');
            }

        } catch (error) {
            console.error("Error during 2FA verification:", error);
            setErrorMessage('Verification failed. Please try again.');
        }
    };


    const emailNotValid = submitted && !enteredEmail.includes("@");
    const passwordNotValid = submitted && enteredPassword.trim().length < 6;

    return (

        <div>
            <Helmet>
                <title>Archer Advising</title>
                <link rel="icon" href="/favicon.png" type="image/png" />
                <link rel="icon" href="/favicon.ico" type="image/x-icon" />
                <meta name="description" content="Login page for Archer Advising platform." />
            </Helmet>
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
                        <p style={{ color: 'black' }}>
                            Don't have an account? <a href="/create-account" style={styles.link}>Create Account</a>
                        </p>
                    </div>
                </div>
                <div className="extra-options" style={styles.extraOptions}>
                    <div style={styles.forgotPassword}>
                        <a href="/forgot-password" style={styles.link}>Forgot your password?</a>
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
        color: "black",
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
    link: {
        color: "#00539C", // Change to desired color
        cursor: "pointer",
    },
};

/* const handleLogin = async (event) => {
        event.preventDefault();
        setSubmitted(true);

        try {
            const formBody = JSON.stringify({
                email: enteredEmail,
                Password: enteredPassword
            });

            const response = await fetch('http://localhost:8080/user/login', {
                method: "POST",
                body: formBody,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.log('Fetched user data:', data);

            if (data.status === 403) {
                setErrorMessage('Please verify your email before logging in.');
                return;
            }

            if (data.status === 401) {
                setErrorMessage('Invalid email or password. Please try again.');
                return;
            }

            if (data.status === 200 && data.message === "User sent 2FA Code") {
                setIs2FARequired(true); // Show the 2FA input field
                setDisplayEmail("");    // Clear display email field
                setErrorMessage('');    // Clear any previous error message
                setUserStateVal(1);     // Update user state value as necessary
                console.log("2FA required, waiting for code.");
            } else {
                setErrorMessage('Unexpected response from the server.');
            }
        } catch (error) {
            setErrorMessage('Login failed. Please check your credentials and try again.');
            console.error('Error during login:', error);
        }
    }; */

/* const handleVerify2FA = async (event) => {
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
            localStorage.setItem('storedEmail', JSON.stringify(enteredEmail)); // Store email AFTER 2FA success
            navigate('/dashboard');
        } else {
            setErrorMessage(data.message || '2FA verification failed');
        }

    } catch (error) {
        setErrorMessage(error.message);
    }
}; */