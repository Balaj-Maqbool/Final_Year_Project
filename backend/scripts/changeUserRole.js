import mongoose from "mongoose";
import { User } from "../src/models/user.model.js";
import { DataBase_URI, DB_NAME } from "../src/constants.js";

const email = process.argv[2];
const role = process.argv[3];

if (!email || !role) {
    console.log("Usage: node scripts/changeUserRole.js <email> <Freelancer|Client>");
    process.exit(1);
}

const changeRole = async () => {
    try {
        const connectionString = `${DataBase_URI}/${DB_NAME}`;
        await mongoose.connect(connectionString);
        console.log("Connected to DB");

        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found!");
        } else {
            console.log(`User found: ${user.email}, Current Role: ${user.role}`);
            user.role = role;
            await user.save();
            console.log(`Updated Role to: ${user.role}`);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
};

changeRole();
