// Routes for industries of biztime db

const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

module.exports = router;

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(
            `SELECT i.code, i.industry, c.name
            FROM industries AS i
            LEFT JOIN companies_industries AS ci
                ON i.code = ci.indu_code
            LEFT JOIN companies AS c
                ON ci.comp_code = c.code;`
        )
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoices`, 404)
        }
        return res.json({industries: results.rows})
    } catch (e) {
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try {
        const {code, industry} = req.body;
        
        const results = await db.query(
        `INSERT INTO industries 
        VALUES ($1, $2)
        RETURNING code, industry`, [code, industry]
        )        
        
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't push industry into database`, 404);
        }

        return res.status(201).json({industry: results.rows[0]})
    } catch (e) {
        return next(e);
    }
})


router.post('/companies-industry', async (req, res, next) => {
    try {
        const {indu_code, comp_code} = req.body;
        const industryResult=  await db.query(
            `SELECT code
            FROM industries
            WHERE code = $1;`, [indu_code]
        )

        if( industryResult.rows.length === 0) {
            throw new ExpressError(`Can't push companies_industries into database`, 404);
        }
        
        const results = await db.query(
            `INSERT INTO companies_industries (comp_code, indu_code)
            VALUES ($1, $2)
            RETURNING indu_code, comp_code`, [ comp_code, indu_code]
            )
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't push companies_industries into database`, 404);
        }

        return res.status(201).json({industry: results.rows[0]})
    } catch (e) {
        return next(e);
    }
})

