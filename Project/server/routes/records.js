import { Router } from "express";
import { connection } from "../database/database.js";
import { SendMail } from "../utils/SendMail.js";

import { ComparePassword, HashedPassword } from "../utils/helper.js";
import * as crypto from "crypto"; //generates tokens

const records = Router();

//fetch records entries from the database
records.get('/', async (req, res) => {
    const { email } = req.query;

    try {
        const query = email
            ? 'SELECT * FROM records WHERE studentEmail = ?'
            : 'SELECT * FROM records';
        const values = email ? [email] : [];

        const [rows] = await connection.execute(query, values);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({ message: 'Failed to fetch records' });
    }
});

records.get('/student-info', async (req, res) => {
    const { email, advisingID } = req.query;

    try {
        console.log('/student-info route accessed with email:', email);

        // Query userdata for First_Name and Last_Name
        const [userResults] = await connection.query('SELECT First_Name, Last_Name FROM userdata WHERE Email = ?', [email]);
        const user = userResults[0]; // Access the first result from userdata query

        // Query records for lastTerm and lastGPA
        const [recordResults] = await connection.query('SELECT advisingID, lastTerm, lastGPA FROM records WHERE studentEmail = ?', [email]);
        const record = recordResults[0]; // Access the first result from records query

        const [courseMappingResults] = await connection.query(
            'SELECT c.courseCode, c.courseName FROM coursemapping AS m INNER JOIN coursecatalog AS c ON m.course_ID = c.courseID WHERE m.advising_ID = ?',
            [advisingID]
        );
        const [prereqMappingResults] = await connection.query(
            'SELECT c.preCourseCode, c.preCourseName FROM prereqmapping AS m INNER JOIN prereqcatalog AS c ON m.course_ID = c.courseID WHERE m.advising_ID = ?',
            [advisingID]
        );
        // Log the results to check their structure
        console.log('User data:', user);
        console.log('Record data:', record);

        if (user && record) {
            res.json({
                firstName: user.First_Name,
                lastName: user.Last_Name,
                lastTerm: record.lastTerm,
                lastGPA: record.lastGPA,
                advisingID: record.advisingID,
                courses: courseMappingResults,
                prereqs: prereqMappingResults,
            });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        console.error('Error retrieving student information:', error);
        res.status(500).json({ message: 'Error retrieving student information' });
    }
});



//update record status and reject reason
records.post('/', async (req, res) => {
    const updatedEntries = req.body; // Expected to be an object with record IDs as keys

    try {
        // Loop through each entry in updatedEntries
        for (const [id, { status, rejectReason }] of Object.entries(updatedEntries)) {
            await connection.execute(
                'UPDATE records SET status = ?, rejectReason = ? WHERE id = ?',
                [status, rejectReason || null, id]
            );
        }

        res.status(200).json({ message: 'Entries updated successfully' });
    } catch (error) {
        console.error('Error updating records:', error);
        res.status(500).json({ message: 'Failed to update records' });
    }
});

records.post('/update-status', async (req, res) => {
    const { updates } = req.body;

    try {
        // Loop through each update to apply changes and send email
        for (const advisingID in updates) {
            const update = updates[advisingID];

            if (update.status === 'accepted' || update.status === 'rejected') {
                // Update the status in the database
                const newStatus = update.status === 'accepted' ? 'Accepted' : 'Rejected';
                await connection.execute(
                    'UPDATE records SET status = ? WHERE advisingID = ?',
                    [newStatus, advisingID]
                );

                // Retrieve student's email and current term from the records table
                const [recordResults] = await connection.execute(
                    'SELECT studentEmail, currentTerm FROM records WHERE advisingID = ?',
                    [advisingID]
                );
                const record = recordResults[0];

                if (record) {
                    const { studentEmail, currentTerm } = record;
                    let subject = 'Your Advising Plan Update';
                    let message;

                    if (update.status === 'accepted') {
                        // Accepted email message
                        message = `Your Advising plan for the term '${currentTerm}' has been accepted.`;
                    } else if (update.status === 'rejected') {
                        // Rejected email message with reason
                        const rejectReason = update.rejectReason || 'No specific reason provided';
                        message = `Your Advising plan for the term '${currentTerm}' has been rejected because: ${rejectReason}`;
                    }

                    // Send the email
                    await SendMail(studentEmail, subject, message);
                }
            }
        }

        res.status(200).json({ message: 'Entries updated and emails sent successfully' });
    } catch (error) {
        console.error('Error updating entries:', error);
        res.status(500).json({ message: 'Failed to update entries' });
    }
});

/* records.post('/create-entry', async (req, res) => {
    const { email, lastTerm, lastGPA, currentTerm, selectedItems1, selectedItems2 } = req.body;

    try {
        // Start a transaction to ensure atomicity
        await connection.beginTransaction();

        // Insert a single record into 'records' table
        const [result] = await connection.execute(
            'INSERT INTO records (studentEmail, lastTerm, lastGPA, currentTerm) VALUES (?, ?, ?, ?)',
            [email, lastTerm, lastGPA, currentTerm]
        );

        // Get the advisingID of the newly created record
        const advisingID = result.insertId;

        // Log selected items to check values (for debugging)
        // console.log("Selected Courses (selectedItems2):", selectedItems2);
        // console.log("Selected Prerequisites (selectedItems1):", selectedItems1);

        // Insert selected courses into 'coursemapping' table
        if (selectedItems2 && selectedItems2.length > 0) {
            const courseMappingValues = selectedItems2.map(courseID => [advisingID, courseID]);
            await connection.query(
                'INSERT INTO coursemapping (advising_ID, course_ID) VALUES ?',
                [courseMappingValues]
            );
        }

        // Insert selected prerequisites into 'prereqmapping' table
        if (selectedItems1 && selectedItems1.length > 0) {
            const prereqMappingValues = selectedItems1.map(courseID => [advisingID, courseID]);
            await connection.query(
                'INSERT INTO prereqmapping (advising_ID, course_ID) VALUES ?',
                [prereqMappingValues]
            );
        }

        // Commit the transaction
        await connection.commit();

        res.status(201).json({ message: 'Entry created successfully' });
    } catch (error) {
        // Roll back the transaction in case of error
        await connection.rollback();
        console.error('Error creating entry:', error);
        res.status(500).json({ message: 'Failed to create entry' });
    }
}); */

records.post('/create-entry', async (req, res) => {
    const { email, lastTerm, lastGPA, currentTerm, selectedItems1, selectedItems2 } = req.body;

    try {
        // Start a transaction to ensure atomicity
        await connection.beginTransaction();

        // Step 1: Insert a single record into 'records' table
        const [result] = await connection.execute(
            'INSERT INTO records (studentEmail, lastTerm, lastGPA, currentTerm) VALUES (?, ?, ?, ?)',
            [email, lastTerm, lastGPA, currentTerm]
        );

        // Step 2: Get the advisingID of the newly created record
        const advisingID = result.insertId;

        // Step 3: Insert selected courses into 'coursemapping' table
        if (selectedItems2 && selectedItems2.length > 0) {
            const courseMappingValues = selectedItems2.map(courseID => [advisingID, courseID]);
            await connection.query(
                'INSERT INTO coursemapping (advising_ID, course_ID) VALUES ?',
                [courseMappingValues]
            );
        }

        // Step 4: Insert selected prerequisites into 'prereqmapping' table
        if (selectedItems1 && selectedItems1.length > 0) {
            const prereqMappingValues = selectedItems1.map(courseID => [advisingID, courseID]);
            await connection.query(
                'INSERT INTO prereqmapping (advising_ID, course_ID) VALUES ?',
                [prereqMappingValues]
            );
        }

        // Commit the transaction
        await connection.commit();

        res.status(201).json({ message: 'Entry created successfully' });
    } catch (error) {
        // Roll back the transaction in case of error
        await connection.rollback();
        console.error('Error creating entry:', error);
        res.status(500).json({ message: 'Failed to create entry' });
    }
});

export default records;