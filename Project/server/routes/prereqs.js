import { Router } from "express";
import { connection } from "../database/database.js";
import { ComparePassword, HashedPassword } from "../utils/helper.js";
import { SendMail } from "../utils/SendMail.js";
import * as crypto from "crypto"; // generates tokens

const prereqs = Router();

prereqs.get('/list', async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT courseID, preCourseCode, preCourseName FROM prereqcatalog');
        console.log('Fetched rows:', rows);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching prerequisites:', error);
        res.status(500).json({ message: 'Failed to fetch prerequisites' });
    }
});

prereqs.post('/add', async (req, res) => {
    const prerequisites = req.body; // Array of courses to add as prerequisites

    if (!Array.isArray(prerequisites) || prerequisites.length === 0) {
        return res.status(400).json({ message: 'Invalid prerequisites list' });
    }

    try {
        // Extract courseIDs from prerequisites
        const courseIDs = prerequisites.map(course => course.courseID);

        // Placeholder string for the courseIDs in the IN clause
        const placeholders = courseIDs.map(() => '?').join(', ');

        // Query to insert full course data from courseCatalog into prereqCatalog
        const query = `
            INSERT INTO prereqcatalog (courseID, preCourseLevel, preCourseCode, preCourseName)
            SELECT courseID, courseLevel, courseCode, courseName FROM coursecatalog
            WHERE courseID IN (${placeholders})
            ON DUPLICATE KEY UPDATE
                preCourseLevel = VALUES(preCourseLevel),
                preCourseCode = VALUES(preCourseCode),
                preCourseName = VALUES(preCourseName);`;

        // Execute the query with the courseIDs as values
        await connection.execute(query, courseIDs);  // Ensure await is used

        res.status(200).json({ message: 'Prerequisites added successfully' });
    } catch (error) {
        console.error('Error adding prerequisites:', error);
        res.status(500).json({ message: 'Failed to add prerequisites' });
    }
});

prereqs.delete('/delete', async (req, res) => {
    const coursesToDelete = req.body; // Array of courses to delete, e.g., [{ courseID: 'C001' }, { courseID: 'C002' }]

    // Validate request body
    if (!Array.isArray(coursesToDelete) || coursesToDelete.length === 0) {
        return res.status(400).json({ message: 'Invalid course list for deletion' });
    }

    try {
        // Prepare placeholders for the number of courseIDs
        const placeholders = coursesToDelete.map(() => '?').join(', ');
        const query = `DELETE FROM prereqCatalog WHERE courseID IN (${placeholders})`;

        // Extract course IDs for the query
        const values = coursesToDelete.map(course => course.courseID);

        // Execute the delete query
        await connection.execute(query, values);  // Ensure await is used
        res.status(200).json({ message: 'Courses removed from prereqCatalog successfully' });
    } catch (error) {
        console.error('Error deleting prerequisites:', error);
        res.status(500).json({ message: 'Failed to delete prerequisites' });
    }
});

export default prereqs;


/* prereqs.get('/list', async (req, res) => {
    try {
        // Await the result of the query
        const result = await connection.execute('SELECT preCourseCode, preCourseName FROM prereqcatalog');

        // Log the type and structure of result to see if it matches expectations
        console.log('Type of result:', typeof result);
        console.log('Query Result:', result);

        // Ensure the result is an array and destructure if so
        if (Array.isArray(result)) {
            const [rows] = result; // rows should contain the data we need
            res.status(200).json(rows);
        } else {
            throw new Error('Unexpected query result format');
        }
    } catch (error) {
        console.error('Error fetching prerequisites:', error);
        res.status(500).json({ message: 'Failed to fetch prerequisites' });
    }
}); */