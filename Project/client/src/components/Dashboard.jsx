import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const [enteredEmail, setEnteredEmail] = useState(null);

    useEffect(() => {
        const storedUserVal = localStorage.getItem('storedEmail');  //passing stored variable through
        if (storedUserVal) {
            const parsedData = JSON.parse(storedUserVal);
            setEnteredEmail(parsedData);
        }
    }, []);

    return (
        <div style={styles.body}>
            <header style={styles.header}>
                <h1>Archer Advising Portal</h1>
                <div>
                    <p>Welcome, {enteredEmail}</p> {/* put username here */}
                </div>
            </header>

            <nav style={styles.nav}>
                <a href="#appointments" style={styles.navLink}>Appointments</a>
                <a href="#resources" style={styles.navLink}>Resources</a>
                <a href="#contact" style={styles.navLink}>Contact Us</a>
            </nav>

            <div style={{ textAlign: 'center' }}>
                <img src="../images/advising_photo_crop.png" alt="Advising Portal Image" style={styles.img} />
            </div>

            <section id="welcome-message" style={styles.section}>
                <h2>We are Here to Help You Succeed</h2>
            </section>

            <section id="services" style={styles.aboutSection}>
                <h3>Our Services</h3>
                <ul>
                    <li>Personalized academic planning</li>
                    <li>Course selection assistance</li>
                    <li>Career counseling</li>
                    <li>Study abroad advising</li>
                    <li>Graduate school preparation</li>
                </ul>
            </section>

            <section id="about" style={styles.aboutSection}>
                <h3>About Us</h3>
                <p>
                    At Archer Advising, we provide guidance to help you achieve your academic and career goals. Whether you're
                    a first-year student or preparing to graduate, our portal is here to support you every step of the way.
                </p>
            </section>


            <section style={styles.passwordSection}>
                <a href="/change-password" style={styles.link}>
                    Change Password
                </a>
            </section>
            <section style={styles.passwordSection}>
                <a href="/change-info" style={styles.link}>
                    Change Info
                </a>
            </section>
        </div>
    );
};

const styles = {
    body: {
        fontFamily: 'Arial, sans-serif',
        margin: 0,
        padding: 0,
        backgroundColor: '#f4f4f9',
    },
    header: {
        backgroundColor: '#00539C',
        color: '#fff',
        padding: '20px',
        textAlign: 'center',
    },
    nav: {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#333',
    },
    navLink: {
        color: 'white',
        padding: '14px 20px',
        textDecoration: 'none',
        textAlign: 'center',
    },
    section: {
        padding: 0,
        textAlign: 'center',
    },
    aboutSection: {
        textAlign: 'left',
    },
    passwordSection: {
        margin: '20px',
        textAlign: 'center',
    },
    link: {
        fontSize: '16px',
        color: '#00539C',
        textDecoration: 'none',
    },
};


/* export default function Dashboard() {
    return (<>
        <div id="login">
            <h1>Welcome! </h1></div>
    </>);
} */