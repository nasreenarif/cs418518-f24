import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import path from "path";

import user from "./routes/user.js";
import prereqs from "./routes/prereqs.js";
import courses from "./routes/courses.js";
import records from "./routes/records.js";


const app = express();
const port = process.env.PORT || 8080;

const myLogger = function (req, res, next) {
    console.log('Calling Api');
    next()
    console.log('Api calling finished');
}

const __dirname = path.resolve();   //this gets root directory

app.use(myLogger);
app.use(bodyParser.json());
app.use(express.json());
app.use(cors({
    /* origin: "http://localhost:5173" */
    /* origin: "*" */
    origin: "https://cs418-advising-website.onrender.com"
    //swap between remote and local deployment
}))




/* app.use(express.static(path.join(__dirname, "public"))); */
// \/ swap with \/ \/
// Serve React frontend ?

app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "DENY");
    next();
});

app.use('/user', user);
app.use('/prereqs', prereqs);
app.use('/courses', courses);
app.use('/records', records);

app.get('/', (req, res) => {
    res.send('Welcome to the CS418 Advising Website API!');
});

// Serve iframe-test.html
app.get("/iframe-test", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "iframe-test.html"));
});

if (process.env.NODE_ENV === "production") {
    const clientBuildPath = path.join(__dirname, "client", "build");
    app.use(express.static(clientBuildPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(clientBuildPath, "index.html"));
    });
}

/* // Serve React frontend ?
const clientBuildPath = path.join(__dirname, 'client', 'build');
app.use(express.static(clientBuildPath));

// Catch-all handler to serve the React app for any route not handled by other middleware
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'App.jsx'));
}); */

app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});

export default app;