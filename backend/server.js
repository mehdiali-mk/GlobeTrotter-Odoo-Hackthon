import dotenv from "dotenv";
import connectDB, { configureMongoDns } from "./configs/connectDB.js";
import app from "./app.js";

dotenv.config({ path: "./.env" });
configureMongoDns();
connectDB();

const runningPort = process.env.PORT || 8088;
app.listen(runningPort, () => {
  console.log(`[LISTENING] Server Listening to PORT: ${runningPort}.`);
});