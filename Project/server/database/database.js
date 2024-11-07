import 'dotenv/config';
import mysql from 'mysql2/promise';
/* import mysql from 'mysql2'; */

/* const connection = mysql.createConnection({ */
const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
})

export { connection };

