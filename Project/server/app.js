// console.log('Hello from node application');

import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import user from "./routes/user.js";
import prereqs from "./routes/prereqs.js";
import courses from "./routes/courses.js";
import records from "./routes/records.js";

const app = express();
const port = 8080;

const myLogger = function (req, res, next) {
    console.log('Calling Api');
    next()
    console.log('Api calling finished');
}

app.use(myLogger);
app.use(bodyParser.json());
app.use(cors({
    origin: "http://localhost:5173"
    //origin: "*"   
    //swap between remote and local deployment
}))
app.use('/user', user);
app.use('/prereqs', prereqs);
app.use('/courses', courses);
app.use('/records', records);



app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});

export default app;