import mysql from 'mysql2';

const connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'123456789',
    database:'course_advising'
})

export { connection };
