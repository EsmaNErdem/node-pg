// Routes for companies of biztime db

const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

router.get("/", async function (req, res, next) {
    try {
        const result = await db.query(
            `SELECT code, name 
                FROM companies 
                ORDER BY name`
        );
        
        debugger;
        return res.json({"companies": result.rows});
    }
  
    catch (err) {
      return next(err);
    }
  });

module.exports = router;