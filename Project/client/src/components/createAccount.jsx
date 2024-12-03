import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateAccount() {
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

    const [First_Name, setFirstName] = useState('');
    const [Last_Name, setLastName] = useState('');
    const [Email, setEmail] = useState('');
    const [Password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(''); // To handle error messages
    const navigate = useNavigate();

    // Password validation logic
    const validatePassword = (password) => {
        const rules = [
            { regex: /.{8,}/, message: "At least 8 characters long" },
            { regex: /[A-Z]/, message: "At least one uppercase letter" },
            { regex: /[a-z]/, message: "At least one lowercase letter" },
            { regex: /[0-9]/, message: "At least one number" },
            { regex: /[!@#$%^&*(),.?":{}|<>]/, message: "At least one special character" },
        ];

        const errors = rules
            .filter((rule) => !rule.regex.test(password))
            .map((rule) => rule.message);

        return errors;
    };

    const handleCreateAccount = async (event) => {
        event.preventDefault();
        setMessage('');
        setError(''); // Clear any previous error

        // Validate password complexity
        const passwordErrors = validatePassword(Password);
        if (passwordErrors.length > 0) {
            setError(`Password must meet the following criteria:\n${passwordErrors.join('\n')}`);
            return;
        }

        try {
            const response = await fetch('/api/user', {
                /* const response = await fetch('http://localhost:8080/user', { */
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: First_Name,
                    lastName: Last_Name,
                    email: Email,
                    password: Password,
                }),
            });

            /* const result = await response.json(); */

            if (response.status === 409) {
                // Email already exists, show error message
                setError('An account with this email already exists.');
            } else if (!response.ok) {
                // Other errors
                throw new Error('Account creation failed');
            } else {
                // Account creation successful, display success message and redirect
                setMessage('Account created successfully! Redirecting to login...');
                setTimeout(() => {
                    navigate('/');
                }, 2000); // Redirect to login after 2 seconds
            }
        } catch (error) {
            setError('Failed to create account. Please try again.');
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Create Account</h2>
            <form onSubmit={handleCreateAccount} style={styles.form}>
                <div>
                    <label htmlFor="firstName">First Name:</label>
                    <input
                        type="text"
                        id="firstName"
                        value={First_Name}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>

                <div>
                    <label htmlFor="lastName">Last Name:</label>
                    <input
                        type="text"
                        id="lastName"
                        value={Last_Name}   //actual database attribute name
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>

                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={Email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>

                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={Password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>

                <button type="submit" style={styles.button}>Create Account</button>
            </form>

            {/* Display success or error message */}
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Back to Login Button */}
            <button onClick={() => navigate('/')} style={styles.backButton}>
                Back to Login
            </button>
        </div>
    );
}

const styles = {
    container: {
        backgroundColor: 'white',
        padding: '40px',
        margin: '50px auto',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '400px',
        textAlign: 'center',
    },
    heading: {
        marginBottom: '20px',
        fontSize: '24px',
        fontWeight: 'bold',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        padding: '10px',
        marginBottom: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        width: '100%',
    },
    button: {
        padding: '10px',
        fontSize: '16px',
        backgroundColor: '#00539C',
        color: 'white',
        borderRadius: '4px',
        cursor: 'pointer',
        width: '100%',
        border: 'none',
        marginTop: '20px',
    },
    backButton: {
        padding: '10px',
        fontSize: '16px',
        backgroundColor: '#e0e0e0',
        color: '#333',
        borderRadius: '4px',
        cursor: 'pointer',
        width: '100%',
        border: 'none',
        marginTop: '10px',
    },
};
