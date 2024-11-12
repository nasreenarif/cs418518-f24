import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ViewEntries() {
    const [entries, setEntries] = useState([]);
    const [error, setError] = useState('');
    const [expandedEntry, setExpandedEntry] = useState(null); // Track expanded entry
    const [updatedEntries, setUpdatedEntries] = useState({}); // Tracks selected status per entry
    const [modalData, setModalData] = useState(null); // For modal content
    const [isModalOpen, setIsModalOpen] = useState(false); // Control modal visibility
    const navigate = useNavigate();

    //get user's stored email
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

    // Fetch student data and open modal
    const handleStudentEmailClick = async (studentEmail) => {
        try {
            //updated to RECORDS/student-info
            const response = await fetch(`http://localhost:8080/records/student-info?email=${studentEmail}`);
            const data = await response.json();
            if (!response.ok) throw new Error('Failed to fetch student info');
            setModalData({ ...data, studentEmail }); // Set modal content
            setIsModalOpen(true); // Open modal
        } catch (error) {
            console.error('Error fetching student info:', error);
            setError('Failed to load student information.');
        }
    };

    // Close the modal
    const closeModal = () => {
        setIsModalOpen(false);
        setModalData(null);
    };

    /* // Handle checkbox selection for Accept and Reject for each specific entry
    const handleStatusChange = (advisingID, status) => {
        setUpdatedEntries((prevEntries) => ({
            ...prevEntries,
            [advisingID]: { ...prevEntries[advisingID], status } // Update only the specific entry's status
        }));
    };

    // Handle text entry for the Reject Reason
    const handleRejectReasonChange = (advisingID, reason) => {
        setUpdatedEntries((prevEntries) => ({
            ...prevEntries,
            [advisingID]: { ...prevEntries[advisingID], rejectReason: reason }
        }));
    }; */

    // Handle Accept checkbox selection
    const handleAcceptChange = (advisingID) => {
        setUpdatedEntries((prevEntries) => ({
            ...prevEntries,
            [advisingID]: { ...prevEntries[advisingID], status: 'accepted', rejectReason: '' } // Clear rejectReason when accepted
        }));
    };

    // Handle Reject checkbox selection
    const handleRejectChange = (advisingID) => {
        setUpdatedEntries((prevEntries) => ({
            ...prevEntries,
            [advisingID]: { ...prevEntries[advisingID], status: 'rejected' } // Only set status to rejected, preserve rejectReason
        }));
    };

    // Handle text entry for the Reject Reason
    const handleRejectReasonChange = (advisingID, reason) => {
        setUpdatedEntries((prevEntries) => ({
            ...prevEntries,
            [advisingID]: { ...prevEntries[advisingID], rejectReason: reason }
        }));
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
                        <React.Fragment key={entry.advisingID}>
                            <tr>
                                <td style={styles.td}>
                                    <span
                                        onClick={() => handleStudentEmailClick(entry.studentEmail)}
                                        style={{ cursor: 'pointer', color: '#00539C' }}
                                    >
                                        {entry.studentEmail}
                                    </span>
                                </td>
                                <td style={styles.td}>{new Date(entry.dateSubmitted).toLocaleDateString()}</td>
                                <td style={styles.td}>{entry.currentTerm}</td>
                                <td style={styles.td}>{entry.status}</td>
                                {isAdmin && (
                                    <td style={styles.td}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={updatedEntries[entry.advisingID]?.status === 'accepted'}
                                                onChange={() => handleAcceptChange(entry.advisingID)}
                                            />
                                            Accept
                                        </label>
                                        <label style={{ marginLeft: '10px' }}>
                                            <input
                                                type="checkbox"
                                                checked={updatedEntries[entry.advisingID]?.status === 'rejected'}
                                                onChange={() => handleRejectChange(entry.advisingID)}
                                            />
                                            Reject
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Reject Reason"
                                            value={updatedEntries[entry.advisingID]?.rejectReason || ''}
                                            onChange={(e) => handleRejectReasonChange(entry.advisingID, e.target.value)}
                                            disabled={updatedEntries[entry.advisingID]?.status !== 'rejected'}
                                            style={styles.rejectInput}
                                        />
                                    </td>
                                )}
                            </tr>
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

            {/* Modal for Student Information */}
            {isModalOpen && modalData && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <h3>Student Info for {modalData.studentEmail}</h3>
                        <p style={{ color: 'black' }}><strong>First Name:</strong> {modalData.firstName}</p>
                        <p style={{ color: 'black' }}><strong>Last Name:</strong> {modalData.lastName}</p>
                        <p style={{ color: 'black' }}><strong>Last Term:</strong> {modalData.lastTerm}</p>
                        <p style={{ color: 'black' }}><strong>Last GPA:</strong> {modalData.lastGPA}</p>
                        <button onClick={closeModal} style={styles.closeButton}>Close</button>
                    </div>
                </div>
            )}
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
        width: '160px',
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
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#fff',
        color: 'black',
        padding: '20px',
        borderRadius: '5px',
        width: '300px',
        textAlign: 'center',
    },
    closeButton: {
        marginTop: '15px',
        padding: '8px 16px',
        backgroundColor: '#00539C',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '5px',
    },
};
