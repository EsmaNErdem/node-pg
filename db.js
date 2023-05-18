/** Database setup for BizTime. */

const { Client } = require("pg");

let DB_URI;
let dbName;

// If we're running in test "mode", use our test db
// Make sure to create both databases!
if (process.env.NODE_ENV === "test") {
    DB_URI = "postgresql:///biztime_test";
    dbName = "biztime_test";
} else {
    DB_URI = "postgresql://postgres@localhost:5432/biztime";
    dbName = "biztime";
}

const db = new Client({
    host: "/var/run/postgresql/",
    database: dbName, 
  });
  
  const checkDatabaseConnection = async () => {
    try {
      await db.connect();
      console.log("Connected to the database!");
    } catch (error) {
      console.error("Error connecting to the database:", error);
    } 
  };
  
  checkDatabaseConnection();
  
  module.exports = db;