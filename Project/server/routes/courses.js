import { Router } from "express";
import { connection } from "../database/database.js";

import { ComparePassword, HashedPassword } from "../utils/helper.js";
import { SendMail } from "../utils/SendMail.js";
import * as crypto from "crypto"; //generates tokens

const courses = Router();

courses.get('/list', async (req, res) => {
    try {
        // Use `await` instead of a callback function
        const [rows] = await connection.execute('SELECT * FROM coursecatalog');
        res.status(200).json({ data: rows });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Failed to fetch courses' });
    }
});

courses.get('/droplist', async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT courseCode, courseName FROM coursecatalog');
        console.log('Fetched rows:', rows);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching prerequisites:', error);
        res.status(500).json({ message: 'Failed to fetch prerequisites' });
    }
});

// Endpoint to save prerequisites to prereqCatalog
courses.post('/prereqs', (req, res) => {
    const prerequisites = req.body;

    if (!Array.isArray(prerequisites) || prerequisites.length === 0) {
        return res.status(400).json({ message: 'Invalid prerequisites data' });
    }

    const values = prerequisites.map(course => [course.courseID, course.courseLevel, course.courseCode, course.courseName]);

    const query = 'INSERT INTO prereqcatalog (courseID, courseLevel, courseCode, courseName) VALUES ?';
    db.query(query, [values], (error) => {
        if (error) {
            console.error('Error saving prerequisites:', error);
            return res.status(500).json({ message: 'Failed to save prerequisites' });
        }
        res.status(201).json({ message: 'Prerequisites saved successfully' });
    });
});

export default courses;