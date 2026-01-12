import mongoose from "mongoose";
import { DB_NAME, DataBase_URI } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${DataBase_URI}/${DB_NAME}`);
        console.log("DataBase Connected !!");

        // console.log("MongoDB Connected !! DB HOST", connectionInstance.connection.host);
    } catch (error) {
        console.log("DB Connection ERROR Failed !! : ", error);
        process.exit(1);
    }
};

export default connectDB;
