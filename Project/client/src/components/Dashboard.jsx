import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import advisingPhoto from '../images/advising_photo_crop.png';

export default function Dashboard() {
    const [enteredEmail, setEnteredEmail] = useState(null);

    const [hovered, setHovered] = useState([false, false, false]);  //allows nav button hovering

    const handleMouseEnter = (index) => {
        const newHovered = [...hovered];
        newHovered[index] = true;
        setHovered(newHovered);
    };
    const handleMouseLeave = (index) => {
        const newHovered = [...hovered];
        newHovered[index] = false;
        setHovered(newHovered);
    };

    const navLinkStyle = (isHovered) => ({
        color: 'white',
        padding: '14px 20px',
        textDecoration: 'none',
        textAlign: 'center',
        backgroundColor: isHovered ? '#222' : '#333', // Darken if hovered
        transition: 'background-color 0.3s',
    });

    useEffect(() => {
        const storedUserVal = localStorage.getItem('storedEmail');  //passing stored variable through
        if (storedUserVal) {
            const parsedData = JSON.parse(storedUserVal);
            setEnteredEmail(parsedData);
        }
    }, []);

    const adminEmail = "great.gavin0@gmail.com";    //sets admin email

    return (
        <div style={styles.body}>
            <Helmet>
                <title>Archer Advising</title>
                <link rel="icon" href="/favicon.png" type="image/png" />
                <link rel="icon" href="/favicon.ico" type="image/x-icon" />
                <meta name="description" content="Archer Advising Dashboard." />
            </Helmet>
            <header style={styles.header}>
                <h1 style={styles.headerTitle}>Archer Advising Portal</h1>
                <div>
                    {enteredEmail === adminEmail ? (
                        /* <p>Welcome to the Administrator Panel, {enteredEmail}</p> */
                        <p>Welcome to the Administrator Panel</p>
                    ) : (
                        <p>Welcome, {enteredEmail}</p>
                    )}
                </div>
            </header>

            <nav style={styles.nav}>
                <a href="#appointments" style={navLinkStyle(hovered[0])}
                    onMouseEnter={() => handleMouseEnter(0)}
                    onMouseLeave={() => handleMouseLeave(0)}>Appointments</a>

                <a href="#resources" style={navLinkStyle(hovered[1])}
                    onMouseEnter={() => handleMouseEnter(1)}
                    onMouseLeave={() => handleMouseLeave(1)}>Resources</a>

                <a href="#contact" style={navLinkStyle(hovered[2])}
                    onMouseEnter={() => handleMouseEnter(2)}
                    onMouseLeave={() => handleMouseLeave(2)}>Contact Us</a>
            </nav>

            <div style={styles.imgContainer}>
                <img src={advisingPhoto} alt="Advising Portal Image" style={styles.img} />
            </div>

            <section id="welcome-message" style={styles.section}>
                <h2 style={styles.headerTwo}>We are Here to Help You Succeed</h2>
            </section>

            <section id="services" style={styles.aboutSection}>
                <h3 style={styles.headerThree}>Our Services</h3>
                <ul style={styles.list}>
                    <li>Personalized academic planning</li>
                    <li>Course selection assistance</li>
                    <li>Career counseling</li>
                    <li>Study abroad advising</li>
                    <li>Graduate school preparation</li>
                </ul>
            </section>

            <section id="about" style={styles.aboutSection}>
                <h3 style={styles.headerThree}>About Us</h3>
                <p style={{ color: 'black' }}>
                    At Archer Advising, we provide guidance to help you achieve your academic and career goals. Whether you're
                    a first-year student or preparing to graduate, our portal is here to support you every step of the way.
                </p><p>. </p>
            </section>

            <section id="advising" style={styles.aboutSection}>
                <h3 style={styles.headerThree}>Advising</h3>
            </section>

            <section style={styles.advisingSection}>
                {enteredEmail === adminEmail ? (
                    <a href="/view-entries" style={styles.button}>Approve or Reject Advising Entries</a>
                ) : (
                    <a href="/create-entry" style={styles.button}>Create Advising Entry</a>
                )}
            </section>
            <section style={styles.advisingSection}>
                {enteredEmail === adminEmail ? (
                    <a href="/edit-prereqs" style={styles.button}>Edit Prerequisites List</a>
                ) : (
                    <a href="/view-entries" style={styles.button}>View Submitted Entries</a>
                )}
            </section>

            <section style={styles.passwordSection}>
                <a href="/change-password" style={styles.button}>
                    Change Password
                </a>
            </section>
            <section style={styles.passwordSection}>
                {enteredEmail === adminEmail ? (
                    <a style={styles.button}>
                        (Administrator must change <br></br>information through backend)
                    </a>
                ) : (
                    <a href="/change-info" style={styles.button}>
                        Change Info
                    </a>
                )}

            </section>
        </div >
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
        marginBottom: '0',
    },
    headerTitle: {
        fontFamily: "Georgia, serif",
        fontSize: "28px",
    },
    headerTwo: {
        fontFamily: "Georgia, serif",
        fontSize: "28px",
        backgroundColor: '#00539C',
        color: '#fff',
        padding: '10px',
    },
    headerThree: {
        fontFamily: "Georgia, serif",
        fontSize: "28px",
        backgroundColor: '#00539C',
        color: '#fff',
        padding: '10px',
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
    advisingSection: {
        margin: '20px',
        textAlign: 'left',
    },
    button: {
        display: 'inline-block',
        margin: '0px',
        padding: '8px 20px',
        backgroundColor: '#004080', // Slightly darker than the main background color
        color: 'white',
        textDecoration: 'none',
        border: '2px solid #003366', // Darker border color
        borderRadius: '5px',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'background-color 0.3s, border-color 0.3s', // Smooth transition for both background and border color
    },
    passwordSection: {
        margin: '20px',
        textAlign: 'right',
    },
    link: {
        fontSize: '16px',
        color: '#00539C',
        textDecoration: 'none',
    },
    list: {
        paddingLeft: '20px', // Indent the list
        fontSize: '16px',
        color: 'black',
    },
    img: {
        backgroundColor: '#333',
        borderRadius: '8px',    //rounded corners
        display: 'block',
        margin: 'auto', //centers photo
        width: '50%',   //governs size
        fontSize: '16px',
        color: 'black',

    },
    imgContainer: {
        backgroundColor: '#333', // Same color as the nav section
        padding: '20px', // Optional: Adds padding around the image
        textAlign: 'center', // Centers image horizontally if it's an inline element
    },
};
