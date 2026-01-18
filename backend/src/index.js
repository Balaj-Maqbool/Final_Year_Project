import connectDB from "./db/db.js";
import { app } from "./app.js";
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

