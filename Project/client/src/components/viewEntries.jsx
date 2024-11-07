import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ViewEntries() {
    const [entries, setEntries] = useState([]);
    const [error, setError] = useState('');
    const [expandedEntry, setExpandedEntry] = useState(null); // Track expanded entry
    const [updatedEntries, setUpdatedEntries] = useState({}); // Tracks selected status per entry
    const navigate = useNavigate();

    // Get the user's stored email
    const email = JSON.parse(localStorage.getItem('storedEmail'));

    const isAdmin = (email === "great.gavin0@gmail.com");

    // Fetch entries from the database that match the user's email
    useEffect(() => {
        async function fetchEntries() {
            try {
                const response = await fetch(isAdmin ? `http://localhost:8080/records` : `http://localhost:8080/records?email=${email}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error('Failed to fetch entries');
                }

                setEntries(data);
            } catch (error) {
                console.error('Error fetching entries:', error);
                setError('Failed to load entries. Please try again later.');
            }
        }

        fetchEntries();
    }, [email, isAdmin]);

    const toggleExpandedView = (id) => {
        setExpandedEntry(expandedEntry === id ? null : id); //collapse if already expanded
    };

    // Handle checkbox selection and text entry for each entry
    const handleStatusChange = (id, status) => {
        setUpdatedEntries({
            ...updatedEntries,
            [id]: { ...updatedEntries[id], status, rejectReason: '' },
        });
    };

    const handleRejectReasonChange = (id, reason) => {
        setUpdatedEntries({
            ...updatedEntries,
            [id]: { ...updatedEntries[id], rejectReason: reason },
        });
    };

    const handleSubmitChanges = async () => {
        try {
            const response = await fetch('http://localhost:8080/records', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedEntries),
            });

            if (!response.ok) {
                throw new Error('Failed to update entries');
            }

            alert('Entries updated successfully');
            // Refetch entries to update the UI after submission
            const refreshedEntries = await fetch(`http://localhost:8080/records`);
            setEntries(await refreshedEntries.json());
            setUpdatedEntries({});
        } catch (error) {
            console.error('Error updating entries:', error);
            setError('Failed to update entries. Please try again later.');
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Submitted Entries</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Date Submitted</th>
                        <th style={styles.th}>Term</th>
                        <th style={styles.th}>Status</th>
                        {isAdmin && <th style={styles.th}>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {entries.map((entry) => (
                        <React.Fragment key={entry.id}>
                            <tr>
                                <td style={styles.td}>
                                    <span onClick={() => toggleExpandedView(entry.id)} style={{ cursor: 'pointer', color: '#00539C' }}>
                                        {entry.email}
                                    </span>
                                </td>
                                <td style={styles.td}>{new Date(entry.dateSubmitted).toLocaleDateString()}</td>
                                <td style={styles.td}>{entry.term}</td>
                                <td style={styles.td}>{entry.status}</td>
                                {isAdmin && (
                                    <td style={styles.td}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={updatedEntries[entry.id]?.status === 'accepted'}
                                                onChange={() => handleStatusChange(entry.id, 'accepted')}
                                            />
                                            Accept
                                        </label>
                                        <label style={{ marginLeft: '10px' }}>
                                            <input
                                                type="checkbox"
                                                checked={updatedEntries[entry.id]?.status === 'rejected'}
                                                onChange={() => handleStatusChange(entry.id, 'rejected')}
                                            />
                                            Reject
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Reject Reason"
                                            value={updatedEntries[entry.id]?.rejectReason || ''}
                                            onChange={(e) => handleRejectReasonChange(entry.id, e.target.value)}
                                            disabled={updatedEntries[entry.id]?.status !== 'rejected'}
                                            style={styles.rejectInput}
                                        />
                                    </td>
                                )}
                            </tr>
                            {expandedEntry === entry.id && (
                                <tr>
                                    <td colSpan={isAdmin ? 5 : 4} style={styles.expandedRow}>
                                        <div style={styles.details}>
                                            <p><strong>First Name:</strong> {entry.firstName}</p>
                                            <p><strong>Last Name:</strong> {entry.lastName}</p>
                                            <p><strong>Last Term:</strong> {entry.lastTerm}</p>
                                            <p><strong>Last GPA:</strong> {entry.lastGPA}</p>
                                            <p><strong>Current Term:</strong> {entry.currentTerm}</p>

                                            <h4>Prerequisite Courses</h4>
                                            <table style={styles.innerTable}>
                                                <thead>
                                                    <tr>
                                                        <th style={styles.th}>Course ID</th>
                                                        <th style={styles.th}>Course Level</th>
                                                        <th style={styles.th}>Course Code</th>
                                                        <th style={styles.th}>Course Name</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {entry.prerequisiteCourses.map((course) => (
                                                        <tr key={course.courseID}>
                                                            <td style={styles.td}>{course.courseID}</td>
                                                            <td style={styles.td}>{course.courseLevel}</td>
                                                            <td style={styles.td}>{course.courseCode}</td>
                                                            <td style={styles.td}>{course.courseName}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>

                                            <h4>All Other Courses</h4>
                                            <table style={styles.innerTable}>
                                                <thead>
                                                    <tr>
                                                        <th style={styles.th}>Course ID</th>
                                                        <th style={styles.th}>Course Level</th>
                                                        <th style={styles.th}>Course Code</th>
                                                        <th style={styles.th}>Course Name</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {entry.otherCourses.map((course) => (
                                                        <tr key={course.courseID}>
                                                            <td style={styles.td}>{course.courseID}</td>
                                                            <td style={styles.td}>{course.courseLevel}</td>
                                                            <td style={styles.td}>{course.courseCode}</td>
                                                            <td style={styles.td}>{course.courseName}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            <div style={styles.buttonContainer}>
                <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
                    Return to Dashboard
                </button>
                {isAdmin && (
                    <button onClick={handleSubmitChanges} style={styles.submitButton}>
                        Submit
                    </button>
                )}
            </div>
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
        width: '100%',
        textAlign: 'center',
    },
    heading: {
        marginBottom: '20px',
        fontSize: '24px',
        fontWeight: 'bold',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '20px',
    },
    th: {
        padding: '10px',
        backgroundColor: '#00539C',
        color: 'white',
        borderBottom: '1px solid #ddd',
        textAlign: 'left',
    },
    td: {
        padding: '10px',
        borderBottom: '1px solid #ddd',
        textAlign: 'left',
    },
    expandedRow: {
        backgroundColor: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'left',
    },
    details: {
        textAlign: 'left',
    },
    innerTable: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '10px',
        marginBottom: '10px',
    },
    rejectInput: {
        marginLeft: '10px',
        padding: '5px',
        width: '100px',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: '10px',
        fontSize: '16px',
        backgroundColor: '#e0e0e0',
        color: '#333',
        borderRadius: '4px',
        cursor: 'pointer',
        width: '150px',
        border: 'none',
    },
    submitButton: {
        padding: '10px',
        fontSize: '16px',
        backgroundColor: '#00539C',
        color: 'white',
        borderRadius: '4px',
        cursor: 'pointer',
        width: '150px',
        border: 'none',
    },
};
