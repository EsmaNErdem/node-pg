// Routes for companies of biztime db

const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");
const slugify = require("slugify");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT code, name FROM companies`);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find companies`, 404)
        }
        return res.json({ companies: results.rows })
    } catch (e) {
        return next(e);
    }
})

router.get('/:code', async (req, res, next) => {
    try {
      const { code } = req.params;
      const results = await db.query(
        `SELECT c.code, c.name, c.description, i.industry
        FROM companies AS c
        LEFT JOIN companies_industries AS ci
          ON c.code = ci.comp_code
        LEFT JOIN industries AS i
          ON ci.indu_code = i.code
        WHERE c.code = $1;`, [code])
      if (results.rows.length === 0) {
        throw new ExpressError(`Can't find company with code of ${code}`, 404)
      }
      const { name, description } = results.rows[0]
      const industries = results.rows.map(r => r.industry)
      return res.send({ company: {code, name, description, industries} })
    } catch (e) {
      return next(e)
    }
})

router.post('/', async (req, res, next) => {
    try {
      const { name, description } = req.body;
      const code = slugify(name, {lower: true});
      const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
      console.log(results)
      if (results.rows.length === 0) {
        throw new ExpressError(`Can't push company into database`, 404)
      }
      return res.status(201).json({ company: results.rows[0] })
    } catch (e) {
      return next(e)
    }
})

router.put('/:code', async (req, res, next) => {
    try {
      const { code } = req.params;
      const { name, description } = req.body;
      const results = await db.query(
        `UPDATE companies
         SET name = $2, description = $3 
         WHERE code = $1 
         RETURNING code, name, description`, [code, name, description]);
      if (results.rows.length === 0) {
        throw new ExpressError(`Can't update company with code of ${code}`, 404)
      }
      return res.status(201).json({ company: results.rows[0] })
    } catch (e) {
      return next(e)
    }
})

router.delete('/:code', async (req, res, next) => {
    try {
      const { code } = req.params;
      const results = await db.query(`DELETE FROM companies WHERE code = $1`, [code])
      return res.send({ status: "DELETED" })
    } catch (e) {
      return next(e)
    }
})


module.exports = router;