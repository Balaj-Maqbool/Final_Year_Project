import { PORT } from "./constants.js";
import { app } from "./app.js";
import connectDB from "./db/db.js";

connectDB()
.then((response) => {
    app.on("error", (error) => {
        console.log("Server Connection Error !!! ", error);
    });

    app.listen(PORT, () => {
        console.log(`server listening at the Port : ${PORT}`);
    
    });
    
})
.catch((error) => {
    console.log("DB Connection Failed !!!", error);
    
        
});


