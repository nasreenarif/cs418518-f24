import { Router } from "express";
import { connection } from "../database/database.js";

import { ComparePassword, HashedPassword } from "../utils/helper.js";
import { SendMail } from "../utils/SendMail.js";
import * as crypto from "crypto"; //generates tokens

const records = Router();


records.post('/create-entry', async (req, res) => {
    const { email, lastTerm, lastGPA, currentTerm, selectedItems1, selectedItems2 } = req.body;

    try {
        // Step 1: Insert new record entry into the `records` table
        const [result] = await connection.execute(
            `INSERT INTO records (studentEmail, lastTerm, lastGPA, currentTerm) VALUES (?, ?, ?, ?)`,
            [email, lastTerm, lastGPA, currentTerm]
        );

        // Get the advising_ID of the newly created record
        const advising_ID = result.insertId;

        // Step 2: Insert entries into `prereqmapping` using selectedItems1 (Prerequisites)
        if (selectedItems1 && selectedItems1.length > 0) {
            const prereqValues = selectedItems1.map((courseID) => [advising_ID, courseID]);
            await connection.query(
                `INSERT INTO prereqmapping (advising_ID, course_ID) VALUES ?`,
                [prereqValues]
            );
        }

        // Step 3: Insert entries into `coursemapping` using selectedItems2 (Courses)
        if (selectedItems2 && selectedItems2.length > 0) {
            const courseValues = selectedItems2.map((courseID) => [advising_ID, courseID]);
            await connection.query(
                `INSERT INTO coursemapping (advising_ID, course_ID) VALUES ?`,
                [courseValues]
            );
        }

        res.status(200).json({ message: 'Entry and mappings created successfully' });
    } catch (error) {
        console.error('Error creating entry and mappings:', error);
        res.status(500).json({ message: 'Failed to create entry and mappings' });
    }
});

// Route to fetch entries based on user email or return all entries for an admin
records.get('/', async (req, res) => {
    const email = req.query.email;
    const isAdmin = email === 'great.gavin0@gmail.com';

    try {
        // Base query to fetch records
        let query = 'SELECT * FROM records';
        const params = [];

        // If not an admin, filter by email
        if (!isAdmin) {
            query += ' WHERE studentEmail = ?';
            params.push(email);
        }

        const [entries] = await connection.execute(query, params);

        // Fetch prerequisite and other courses for each record entry if needed
        for (const entry of entries) {
            // Query for prerequisite courses linked to this entry's ID
            const [prerequisiteCourses] = await connection.execute(
                `SELECT * FROM coursecatalog AS a INNER JOIN coursemapping AS b ON a.courseID WHERE a.courseID = b.course_ID`,
                [entry.id]
            );

            /* SELECT * FROM course_catalog AS a INNER JOIN course_mapping AS b ON a.course_id WHERE a.course_id = b.course_id */

            // Query for other courses linked to this entry's ID
            const [otherCourses] = await connection.execute(
                `SELECT * FROM prereqcatalog AS a INNER JOIN prereqmapping AS b ON a.courseID WHERE a.courseID = b.course_ID`,
                [entry.id]
            );

            entry.prerequisiteCourses = prerequisiteCourses;
            entry.otherCourses = otherCourses;
        }

        res.status(200).json(entries);
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({ message: 'Failed to retrieve records' });
    }
});

export default records;