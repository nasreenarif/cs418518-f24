import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
/* import "../styles/loginStyle.css" */


export default function Login() {
    const [enteredEmail, setEnteredEmail] = useState("");
    const [enteredPassword, setEnteredPassword] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();
    /* const [errorMessage, setErrorMessage] = useState(''); // For error messages */
    const [userStateVal, setUserStateVal] = useState(true);
    // const [message, setMessage] = useState("");

    function handleInputChange(identifier, value) {
        if (identifier === "email") {
            setEnteredEmail(value);
        } else {
            setEnteredPassword(value);
        }
    }

    const handleLogin = async () => {
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

            if (!response.ok) {
                throw new Error('Login failed'); // Handle HTTP errors
            }

            const data = await response.json();
            console.log('Fetched user data:', data); // Log the fetched data
            navigate('/dashboard');     //placed outside IF

            // Check if login is successful
            if (data.data.length > 0) {
                // If login is successful, redirect to the profile page
                setUserStateVal(1);
                /* localStorage.setItem('storedUserData', JSON.stringify(data.user));      //stored local variables as strings in memory
                localStorage.setItem('storedUserStateVal', JSON.stringify(userStateVal)); */
                localStorage.setItem('storedEmail', JSON.stringify(enteredEmail));
                console.log("userStateVal = " + userStateVal);

                /* navigate('/dashboard'); */
            } else {
                // Show error message if login fails
                console.log('Invalid credentials. Please try again.');
                setErrorMessage('Invalid credentials. Please try again.');
            }

            /* if (result.ok) {
                const data = result.json();
                console.log(data)
                // console.log(result);
                navigate('/dashboard')
            }
            else if (!result.ok) {
                throw new Error('Credentials Invalid');
            } */
        }
        catch (error) {
            alert('Credentials Invalid');
            /* console.error('Login Failed: ', error); */
        }
    }

    const emailNotValid = submitted && !enteredEmail.includes("@");
    const passwordNotValid = submitted && enteredPassword.trim().length < 6;

    return (
        <div>
            <header style={{ backgroundColor: "#00539C", color: "#fff", padding: "20px", textAlign: "center" }}>
                <h1>Welcome to Archer Advising</h1>
                <p>CS418 Web Programming Fall 2024</p>
            </header>

            <div id="login" style={styles.loginContainer}>
                <h2>Login</h2>
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

                    <div className="actions" style={styles.actions}>
                        <button type="button" className="text-button" style={styles.textButton}>
                            Create a new account
                        </button>
                        <button className="button" style={styles.button} type="submit">
                            Sign In
                        </button>
                    </div>
                </form>

                <div className="create-account" style={styles.createAccount}>
                    <p>
                        Don't have an account? <a href="login/create">Create Account</a>
                    </p>
                </div>
                <div className="extra-options" style={styles.extraOptions}>
                    <a href="login/reset">Forgot your password?</a>
                </div>
            </div>
        </div>
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
};

