import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';

export default function ChangeInfo() {
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
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const email = JSON.parse(localStorage.getItem('storedEmail'));  //locally stored email

    const handleChangeInfo = async (event) => {
        event.preventDefault();
        setMessage('');
        setError('');

        try {
            console.log("First name, Last name:", First_Name, Last_Name);
            const response = await fetch('http://localhost:8080/user/change-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email, // Locally stored email
                    firstName: First_Name,
                    lastName: Last_Name,
                }),
            });
            console.log("Email used for change:", email);

            if (!response.ok) {
                throw new Error('Failed to update user information');
            }

            setMessage('Information updated successfully!');
            setTimeout(() => {
                navigate('/dashboard'); // Redirect to dashboard after 2s
            }, 2000);
        } catch (error) {
            setError('Failed to update your information. Please try again.');
        }
    };


    return (
        <div style={styles.container}>
            <Helmet>
                <title>Archer Advising</title>
                <link rel="icon" href="/favicon.png" type="image/png" />
                <link rel="icon" href="/favicon.ico" type="image/x-icon" />
                <meta name="description" content="Change information page." />
            </Helmet>
            <h2 style={styles.heading}>Changing Personal Info for "{email}"</h2>
            <form onSubmit={handleChangeInfo} style={styles.form}>
                <div>
                    <label htmlFor="firstName">New First Name:</label>
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
                    <label htmlFor="lastName">New Last Name:</label>
                    <input
                        type="text"
                        id="lastName"
                        value={Last_Name}    //actual database attribute name
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>

                <button type="submit" style={styles.button}>Update Info</button>
            </form>

            {/* Display success or error message */}
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Back to Dashboard Button */}
            <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
                Back to Dashboard
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
        width: '500px',
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
