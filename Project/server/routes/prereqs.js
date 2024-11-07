import { Router } from "express";
import { connection } from "../database/database.js";

import { ComparePassword, HashedPassword } from "../utils/helper.js";
import { SendMail } from "../utils/SendMail.js";
import * as crypto from "crypto"; //generates tokens

const prereqs = Router();

prereqs.get("/list", (req, res) => {
    connection.execute(
        'SELECT * from prereqcatalog',

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



export default prereqs;