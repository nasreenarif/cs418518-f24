import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CourseCatalog() {
    const [courses, setCourses] = useState([]);
    const [selectedPrerequisites, setSelectedPrerequisites] = useState({});
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Fetch all courses from the courseCatalog database
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('http://localhost:8080/courses/list');
                if (!response.ok) throw new Error('Failed to fetch courses');
                const data = await response.json();
                console.log("Data fetched:", data);
                setCourses(data.data);
            } catch (error) {
                console.error('Error fetching courses:', error);
                setError('Failed to load courses. Please try again later.');
            }
        };

        fetchCourses();
    }, []);

    const handleCheckboxChange = (courseID, type) => {
        setSelectedPrerequisites((prev) => ({
            ...prev,
            [courseID]: type
        }));
    };

    // Handle submit to add or delete courses from prereqCatalog
    const handleSubmit = async () => {
        const prerequisitesToAdd = Object.entries(selectedPrerequisites)
            .filter(([_, type]) => type === 'prerequisite')
            .map(([courseID]) => ({ courseID }));

        const prerequisitesToDelete = Object.entries(selectedPrerequisites)
            .filter(([_, type]) => type === 'course')
            .map(([courseID]) => ({ courseID }));

        try {
            if (prerequisitesToAdd.length > 0) {
                await fetch('http://localhost:8080/prereqs/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(prerequisitesToAdd),
                });
            }

            if (prerequisitesToDelete.length > 0) {
                await fetch('http://localhost:8080/prereqs/delete', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(prerequisitesToDelete),
                });
            }

            alert('Prerequisites updated successfully');
        } catch (error) {
            console.error('Error updating prerequisites:', error);
            setError('Failed to update prerequisites. Please try again later.');
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Course Catalog</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Course ID</th>
                        <th style={styles.th}>Course Level</th>
                        <th style={styles.th}>Course Code</th>
                        <th style={styles.th}>Course Name</th>
                        <th style={styles.th}>Prerequisites List:</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map((course) => (
                        <tr key={course.courseID}>
                            <td style={styles.td}>{course.courseID}</td>
                            <td style={styles.td}>{course.courseLevel}</td>
                            <td style={styles.td}>{course.courseCode}</td>
                            <td style={styles.td}>{course.courseName}</td>
                            <td style={styles.td}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={selectedPrerequisites[course.courseID] === 'course'}
                                        onChange={() => handleCheckboxChange(course.courseID, 'course')}
                                    />
                                    Remove From
                                </label>
                                <label style={{ marginLeft: '10px' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedPrerequisites[course.courseID] === 'prerequisite'}
                                        onChange={() => handleCheckboxChange(course.courseID, 'prerequisite')}
                                    />
                                    Add To
                                </label>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={styles.buttonContainer}>
                <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
                    Return to Dashboard
                </button>
                <button onClick={handleSubmit} style={styles.submitButton}>
                    Submit
                </button>
            </div>
        </div>
    );
}

// Styles
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