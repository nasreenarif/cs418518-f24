import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation } from 'react-router-dom';

export default function CreateEntry() {
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

    const location = useLocation();
    const entryData = location.state?.entry || {};
    const [lastTerm, setLastTerm] = useState(entryData.lastTerm || '');
    const [lastGPA, setLastGPA] = useState(entryData.lastGPA || '');
    const [currentTerm, setCurrentTerm] = useState(entryData.currentTerm || '');
    const [selectedItemsCourses, setSelectedItemsCourses] = useState([]);
    const [selectedItemsPrereqs, setSelectedItemsPrereqs] = useState([]);
    const [courseOptions, setCourseOptions] = useState([]);  // Options for the "Course Plan" dropdown
    const [prereqOptions, setPrereqOptions] = useState([]); // Options for the "Prerequisites" dropdown
    const [previousCourses, setPreviousCourses] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const email = JSON.parse(localStorage.getItem('storedEmail'));  // Get stored email

    useEffect(() => {
        console.log('Received entry data:', entryData);
    }, [entryData]);

    useEffect(() => {
        async function fetchDropdownOptions() {
            try {
                // Fetch course options
                const courseResponse = await fetch('/api/courses/droplist');
                /* const courseResponse = await fetch('http://localhost:8080/courses/droplist'); */
                const courseData = await courseResponse.json();
                if (!courseResponse.ok) throw new Error('Failed to fetch course options');

                // Fetch prerequisite options
                const prereqResponse = await fetch('/api/prereqs/list');
                /* const prereqResponse = await fetch('http://localhost:8080/prereqs/list'); */
                const prereqData = await prereqResponse.json();
                if (!prereqResponse.ok) throw new Error('Failed to fetch prerequisite options');

                setCourseOptions(courseData);
                setPrereqOptions(prereqData);

                console.log('Fetched prerequisite options:', prereqData);
                // Update dropdown selections after options are fetched
                setSelectedItemsCourses(
                    entryData.courses?.map((course) =>
                        courseData.find((option) => option.courseCode === course.courseCode)?.courseCode || ''
                    ) || []
                );
                setSelectedItemsPrereqs(
                    entryData.prereqs?.map((prereq) =>
                        prereqData.find((option) => option.preCourseCode === prereq.preCourseCode)?.preCourseCode || ''
                    ) || []
                );

            } catch (error) {
                console.error('Error fetching dropdown options:', error);
                setError('Failed to load options.');
            }
        }
        fetchDropdownOptions();
    }, []); //fill these brackets with entryData to bring back endless loop

    useEffect(() => {
        async function fetchPreviousCourses() {
            try {
                const response = await fetch(`/api/records/previous-courses?email=${email}`);
                /* const response = await fetch(`http://localhost:8080/records/previous-courses?email=${email}`); */
                if (!response.ok) {
                    throw new Error('Failed to fetch already scheduled courses');
                }

                const data = await response.json();
                setPreviousCourses(data); // Assuming `data` is an array of course codes
            } catch (error) {
                console.error('Error fetching scheduled courses:', error);
                setError('Failed to load already scheduled courses.');
            }
        }

        fetchPreviousCourses();
    }, [email]);

    const handleCreateEntry = async (event) => {
        console.log('handleCreateEntry triggered');
        event.preventDefault();
        setMessage('');
        setError('');



        // Map courseCode to courseID for selected courses
        const selectedCourseIDs = selectedItemsCourses.map(courseCode => {
            const course = courseOptions.find(option => option.courseCode === courseCode);
            return course ? course.courseID : null;
        }).filter(courseID => courseID !== null); // Filter out any nulls

        // Map courseCode to courseID for selected prerequisites
        const selectedPrereqIDs = selectedItemsPrereqs.map(courseCode => {
            const prereq = prereqOptions.find(option => option.preCourseCode === courseCode);
            return prereq ? prereq.courseID : null;
        }).filter(courseID => courseID !== null); // Filter out any nulls

        try {
            console.log('Submitting data:', {
                email: email,
                lastTerm,
                lastGPA,
                currentTerm,
                selectedItems1: selectedPrereqIDs, // Send mapped course IDs
                selectedItems2: selectedCourseIDs, // Send mapped course IDs
            });

            const response = await fetch('/api/records/create-entry', {
                /* const response = await fetch('http://localhost:8080/records/create-entry', { */
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    lastTerm,
                    lastGPA,
                    currentTerm,
                    selectedItems1: selectedPrereqIDs, // Send mapped course IDs
                    selectedItems2: selectedCourseIDs, // Send mapped course IDs
                }),
            });

            if (!response.ok) {
                // Parse the error response from the backend
                const errorData = await response.json();
                console.error('Backend error:', errorData);

                // Handle conflicting courses and prerequisites
                if (errorData.message && errorData.conflictingCourses) {
                    setError(`${errorData.message} ${errorData.conflictingCourses.join(', ')}`);
                } else if (errorData.message && errorData.conflictingPrereqs) {
                    setError(`${errorData.message} ${errorData.conflictingPrereqs.join(', ')}`);
                } else {
                    setError('An unknown error occurred. Please try again.');
                }
                return;
            }

            setMessage('Entry submitted successfully!');
            setTimeout(() => {
                navigate('/dashboard'); // Redirect to dashboard after success
            }, 2000);
        } catch (error) {
            console.error('Error in submission:', error.message);
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
            <Helmet>
                <title>Archer Advising</title>
                <link rel="icon" href="/favicon.png" type="image/png" />
                <link rel="icon" href="/favicon.ico" type="image/x-icon" />
                <meta name="description" content="Creat Advising entry." />
            </Helmet>
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
                            key={index}
                            value={selectedItem}
                            onChange={(e) => {
                                const newPrereqs = [...selectedItemsPrereqs];
                                newPrereqs[index] = e.target.value;
                                setSelectedItemsPrereqs(newPrereqs);
                            }}
                        >
                            <option value="" disabled>Prerequisite Courses</option>
                            {prereqOptions.map((option) => (
                                <option key={option.preCourseCode} value={option.preCourseCode}>
                                    {option.preCourseName}
                                </option>
                            ))}
                        </select>
                    ))}
                    {/* currently working */}
                    {/* {selectedItemsPrereqs.map((selectedItem, index) => (
                        <select
                            key={`list1-${index}`}
                            value={selectedItem}
                            onChange={(e) => handleDropdownChangeList1(index, e.target.value)}
                            style={styles.select}
                        >
                            <option value="" disabled>Prerequisite Courses</option>
                            {prereqOptions.map((option) => (
                                <option key={option.preCourseCode} value={option.preCourseCode}>
                                    {option.preCourseName}
                                </option>
                            ))}
                        </select>
                    ))} */}
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
                            key={index}
                            value={selectedItem}
                            onChange={(e) => {
                                const newCourses = [...selectedItemsCourses];
                                newCourses[index] = e.target.value;
                                setSelectedItemsCourses(newCourses);
                            }}
                        >
                            <option value="" disabled>Planned Courses</option>
                            {courseOptions.map((option) => (
                                <option key={option.courseCode} value={option.courseCode}>
                                    {option.courseName}
                                </option>
                            ))}
                        </select>
                    ))}
                    {/* currently working */}
                    {/* {selectedItemsCourses.map((selectedItem, index) => (
                        <select
                            key={`list2-${index}`}
                            value={selectedItem}
                            onChange={(e) => handleDropdownChangeList2(index, e.target.value)}
                            style={styles.select}
                        >
                            <option value="" disabled>Planned Courses</option>
                            {courseOptions.map((option) => (
                                <option key={option.courseCode} value={option.courseCode}>
                                    {option.courseName}
                                </option>
                            ))}
                        </select>
                    ))} */}
                </div>

                {/*button to add new course*/}
                <button type="button" onClick={handleAddDropdown2} style={styles.addButton}>
                    Add Planned Course
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