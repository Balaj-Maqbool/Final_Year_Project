import connectDB from "./db/db.js";
import { app } from "./db/app.js";
import { PORT } from "./constants.js";

connectDB()
    .then((response) => {
        app.on("error", (error) => {
            console.log("Server Connection Error !!! ", error);
        });

        app.listen(PORT, () => {
            console.log(`server listening at the Port : ${PORT}`);
        });

        // console.log(response);
    })
    .catch((error) => {
        console.log("DB Connection Failed !!!", error);
    });

/*
import dotenv from "dotenv"
import mongoose from "mongoose"
import express from "express"
import { DB_NAME } from "./constants.js"

dotenv.config()

const app = express();
const DataBase_URI = process.env.DataBase_URI;
const PORT = process.env.PORT;

    (async () => {
        try {
            const dbResponse = await mongoose.connect(`${DataBase_URI}/${DB_NAME}`)
            // console.log("Database Connected!! \n",dbResponse);

            app.on("error", (err) => {
                console.log("Error", err);

            })
            app.listen(PORT,()=>{
                console.log(`App  running at http://localhost:${PORT}`);
                
            })
        } catch (error) {
            console.log(`Error: `, error)
        }
    })()
*/
