import 'dotenv/config';
import mysql from 'mysql2/promise';

let connection;

async function initializeConnection() {
    if (!connection) {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            port: process.env.DB_PORT
        });

        console.log("Database connection established");

        // Optionally handle connection errors and reconnect
        connection.on('error', async (err) => {
            console.error("Database connection error:", err);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                console.log("Reconnecting to the database...");
                connection = await mysql.createConnection({
                    host: process.env.DB_HOST,
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DB_DATABASE,
                    port: process.env.DB_PORT
                });
                console.log("Database reconnected");
            }
        });
    }
}

await initializeConnection();

export { connection };
