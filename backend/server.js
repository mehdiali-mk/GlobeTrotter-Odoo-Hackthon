const dotenv = require('dotenv');
const connectDB = require('./configs/connectDB.js');
const { configureMongoDns } = require('./configs/connectDB.js');
const app = require('./app.js');

dotenv.config({ path: './.env' });
configureMongoDns();
connectDB();

const runningPort = process.env.PORT || 8088;
app.listen(runningPort, () => {
  console.log(`[LISTENING] Server Listening to PORT: ${runningPort}.`);
});