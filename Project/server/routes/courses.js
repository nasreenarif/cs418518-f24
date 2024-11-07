import { Router } from "express";
import { connection } from "../database/database.js";

import { ComparePassword, HashedPassword } from "../utils/helper.js";
import { SendMail } from "../utils/SendMail.js";
import * as crypto from "crypto"; //generates tokens

const courses = Router();

courses.get("/list", (req, res) => {
    connection.execute(
        'SELECT * from coursecatalog',

        function (err, result) {
            if (err) {
                res.json(err.message);
            } else {
                res.json({
                    data: result,
                });
            }
        }
    );
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