import React, { useState } from 'react';

export default function ChangePassword() {
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

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
    };

    return (
        <div style={styles.body}>
            <h2>Change Password</h2>
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

            {/* Display error or success messages */}
            {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
            {passwordSuccess && <p style={{ color: 'green' }}>{passwordSuccess}</p>}
        </div>
    );
}

const styles = {
    body: {
        fontFamily: 'Arial, sans-serif',
        margin: '20px',
        padding: '20px',
        backgroundColor: '#f4f4f9',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        width: '300px',
        margin: '0 auto',
    },
    input: {
        padding: '10px',
        marginBottom: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    button: {
        padding: '10px',
        fontSize: '16px',
        backgroundColor: '#00539C',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};
