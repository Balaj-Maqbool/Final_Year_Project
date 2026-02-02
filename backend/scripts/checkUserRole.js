import mongoose from "mongoose";
import { User } from "../src/models/user.model.js";
import { DataBase_URI, DB_NAME } from "../src/constants.js";

const checkUsers = async () => {
    try {
        const connectionString = `${DataBase_URI}/${DB_NAME}`;
        console.log("Connecting...");
        await mongoose.connect(connectionString);
        console.log("Connected.");

        const users = await User.find({}, "email username role _id");
        console.log(`Users found: ${users.length}`);
        
        users.forEach(u => {
            console.log(JSON.stringify({ 
                id: u._id, 
                email: u.email, 
                role: u.role, 
                username: u.username 
            }, null, 2));
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
};

checkUsers();
