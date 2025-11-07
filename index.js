const { readDb } = require("./utils/readDb.js");
const parseLibrary = (dbPath) => readDb(dbPath);
module.exports = { parseLibrary };
