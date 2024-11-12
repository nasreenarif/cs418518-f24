import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ChangePassword() {
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const navigate = useNavigate();

    const handleChangePassword = async (event) => {
        event.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        // Validate that new password and confirm password match
        if (newPassword !== confirmPassword) {
            setPasswordError('New password and confirm password do not match.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/user/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,  // Added email to the payload
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                }),
            });

            if (response.ok) {
                setPasswordSuccess('Password changed successfully!');
                setEmail('');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                const data = await response.json();
                setPasswordError(data.message || 'Failed to change password.');
            }
        } catch (error) {
            setPasswordError('An error occurred. Please try again.');
        }
    };

    /* const handleChangePassword = async (event) => {
        event.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        // Validate that new password and confirm password match
        if (newPassword !== confirmPassword) {
            setPasswordError('New password and confirm password do not match.');
            return;
        }

        try {
            // Make a POST request to your backend API to change the password
            const response = await fetch('http://localhost:8080/user/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,  // Added email to the payload
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                }),
            });

            // Handle API response
            if (!response.ok) {
                throw new Error('Password change failed');
            }

            // If successful, reset the form fields and display success message
            setPasswordSuccess('Password changed successfully!');
            setEmail('');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setPasswordError('Failed to change password. Please try again.');
        }
    }; */

    return (
        <div style={styles.container}>
            <h2 style={styles.h2}>Password Change Form</h2>
            <form onSubmit={handleChangePassword} style={styles.form}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>

                <div>
                    <label htmlFor="currentPassword">Current Password:</label>
                    <input
                        type="password"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>

                <div>
                    <label htmlFor="newPassword">New Password:</label>
                    <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword">Confirm New Password:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>

                <button type="submit" style={styles.button}>Change Password</button>
            </form>
            {/* Back to Dashboard Button */}
            <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
                Back to Dashboard
            </button>

            {/* Display error or success messages */}
            {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
            {passwordSuccess && <p style={{ color: 'green' }}>{passwordSuccess}</p>}
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
        width: '500px',
        textAlign: 'center',
    },
    heading: {
        marginBottom: '20px',
        fontSize: '24px',
        fontWeight: 'bold',
    },
    h2: {
        marginBottom: '10px',
        fontSize: '20px',
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
