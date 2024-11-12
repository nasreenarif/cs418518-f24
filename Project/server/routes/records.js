import { Router } from "express";
import { connection } from "../database/database.js";

import { ComparePassword, HashedPassword } from "../utils/helper.js";
import { SendMail } from "../utils/SendMail.js";
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
    const { email } = req.query;

    try {
        console.log('/student-info route accessed with email:', email);

        // Query userdata for First_Name and Last_Name
        const [userResults] = await connection.query('SELECT First_Name, Last_Name FROM userdata WHERE Email = ?', [email]);
        const user = userResults[0]; // Access the first result from userdata query

        // Query records for lastTerm and lastGPA
        const [recordResults] = await connection.query('SELECT lastTerm, lastGPA FROM records WHERE studentEmail = ?', [email]);
        const record = recordResults[0]; // Access the first result from records query

        // Log the results to check their structure
        console.log('User data:', user);
        console.log('Record data:', record);

        if (user && record) {
            res.json({
                firstName: user.First_Name,
                lastName: user.Last_Name,
                lastTerm: record.lastTerm,
                lastGPA: record.lastGPA,
            });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        console.error('Error retrieving student information:', error);
        res.status(500).json({ message: 'Error retrieving student information' });
    }
});


/* records.get('/student-info', async (req, res) => {
    const { email } = req.query;
    try {
        console.log('/student-info route accessedwith email: ', email);
        const [user] = await db.query('SELECT First_Name, Last_Name FROM userdata WHERE email = ?', [email]);
        const [record] = await db.query('SELECT lastTerm, lastGPA FROM records WHERE email = ?', [email]);
        if (user && record) {
            res.json({ firstName: user.First_Name, lastName: user.Last_Name, lastTerm: record.lastTerm, lastGPA: record.lastGPA });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving student information' });
    }
}); */

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

export default records;