import React, { useState } from 'react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleForgotPassword = async (event) => {
        event.preventDefault();
        setMessage('');

        try {
            const response = await fetch('http://localhost:8080/user/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error('Failed to send reset link');
            }

            setMessage('A password reset link has been sent to your email.');
        } catch (error) {
            setMessage('Failed to send reset link. Please try again.');
        }
    };

    return (
        <div>
            <h2>Forgot Password</h2>
            <form onSubmit={handleForgotPassword} style={styles.form}>
                <label htmlFor="email">Enter your email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                />

                <button type="submit" style={styles.button}>Send Reset Link</button>
            </form>

            {message && <p>{message}</p>}
        </div>
    );
}

const styles = {
    form: {
        display: 'flex',
        flexDirection: 'column',
        width: '300px',
        margin: 'auto',
    },
    input: {
        padding: '10px',
        marginBottom: '10px',
        borderRadius: '4px',
    },
    button: {
        padding: '10px',
        backgroundColor: '#00539C',
        color: 'white',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};
