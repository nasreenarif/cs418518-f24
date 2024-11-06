import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateEntry() {
    const [lastTerm, setLastTerm] = useState('');
    const [lastGPA, setLastGPA] = useState('');
    const [currentTerm, setCurrentTerm] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [dropdownOptions, setDropdownOptions] = useState([]); // Options from the database
    const [selectedItemsPrereqs, setSelectedItemsPrereqs] = useState(['']); // Array to hold each dropdown's selected value
    const [selectedItemsCourses, setSelectedItemsCourses] = useState(['']); // Array to hold each dropdown's selected value
    const navigate = useNavigate();

    const email = JSON.parse(localStorage.getItem('storedEmail'));  // Get stored email

    useEffect(() => {
        async function fetchOptions() {
            try {
                const response = await fetch('http://localhost:8080/items');    //change SQL call
                const data = await response.json();
                setDropdownOptions(data); // Set options from the response
            } catch (error) {
                console.error('Error fetching dropdown course selection:', error);
                setError('Failed to load courses.');
            }
        }
        fetchOptions();
    }, []);

    const handleCreateEntry = async (event) => {
        event.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await fetch('http://localhost:8080/records/create-entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    lastTerm,
                    lastGPA,
                    currentTerm,
                    selectedItems1: selectedItemsPrereqs, // Array of selected items from dropdowns
                    selectedItems2: selectedItemsCourses,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create entry');
            }

            setMessage('Entry submitted successfully!');
            setTimeout(() => {
                navigate('/dashboard'); // Redirect to dashboard after success
            }, 2000);
        } catch (error) {
            setError('Failed to submit entry. Please try again.');
        }
    };

    //handles dropdown change
    const handleDropdownChangeList1 = (index, value) => {
        const newSelectedItems = [...selectedItemsPrereqs];
        newSelectedItems[index] = value;
        setSelectedItemsPrereqs(newSelectedItems);
    };
    const handleDropdownChangeList2 = (index, value) => {
        const newSelectedItems = [...selectedItemsCourses];
        newSelectedItems[index] = value;
        setSelectedItemsCourses(newSelectedItems);
    };

    //adds new dropdown
    const handleAddDropdown1 = () => {
        setSelectedItemsPrereqs([...selectedItemsPrereqs, '']); // Add an empty value for a new dropdown
    };
    const handleAddDropdown2 = () => {
        setSelectedItemsCourses([...selectedItemsCourses, '']); // Add an empty value for a new dropdown
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Create New Advising Entry for "{email}"</h2>
            <form onSubmit={handleCreateEntry} style={styles.form}>
                <div>
                    <label htmlFor="lastTerm">Last Term:</label>
                    <input
                        type="text"
                        id="lastTerm"
                        value={lastTerm}
                        onChange={(e) => setLastTerm(e.target.value)}
                        required
                        style={styles.input}
                    />
                    <label htmlFor="lastGPA">Last Term GPA:</label>
                    <input
                        type="number"
                        step="0.1"
                        id="lastGPA"
                        value={lastGPA}
                        onChange={(e) => setLastGPA(e.target.value)}
                        required
                        style={styles.input}
                    />
                    <label htmlFor="currentTerm">Current Term:</label>
                    <input
                        type="text"
                        id="currentTerm"
                        value={currentTerm}
                        onChange={(e) => setCurrentTerm(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>

                {/*renders dropdown menu for prereqs*/}
                <div>
                    <label>Select Prerequisites:</label>
                    {selectedItemsPrereqs.map((selectedItem, index) => (
                        <select
                            key={`list1-${index}`}
                            value={selectedItem}
                            onChange={(e) => handleDropdownChangeList1(index, e.target.value)}
                            style={styles.select}
                        >
                            <option value="" disabled>Prerequisite Courses</option>
                            {dropdownOptions.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    ))}
                </div>
                {/*button to add new prereq*/}
                <button type="button" onClick={handleAddDropdown1} style={styles.addButton}>
                    Add Prerequisite Course
                </button>



                {/*renders dropdown menu for courses*/}
                <div>
                    <label>Course Plan:</label>
                    {selectedItemsCourses.map((selectedItem, index) => (
                        <select
                            key={`list2-${index}`}
                            value={selectedItem}
                            onChange={(e) => handleDropdownChangeList2(index, e.target.value)}
                            style={styles.select}
                        >
                            <option value="" disabled>Planned Courses</option>
                            {dropdownOptions.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    ))}
                </div>
                {/*button to add new course*/}
                <button type="button" onClick={handleAddDropdown2} style={styles.addButton}>
                    Add Another Course
                </button>


                <button type="submit" style={styles.button}>Submit Entry</button>
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
        padding: '20px',
        margin: '50px auto',
        borderRadius: '18px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '100%',
        textAlign: 'left',
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
    select: {
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
    addButton: {
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
