const { Client } = require("pg");

let DB_URI;

// If we're running in test "mode", use our test db
// Make sure to create both databases!
if (process.env.NODE_ENV === "test") {
    DB_URI = "postgresql:///biztime_test";
} else {
    DB_URI = "postgresql://postgres@localhost:5432/biztime";
}

const db = new Client({
  connectionString: DB_URI,
  database: "biztime" // Specify the database here
});

async () => {
    await db.connect();
}

module.exports = db;
