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
      const results = await db.query(`SELECT * FROM companies WHERE code = $1`, [code])
      if (results.rows.length === 0) {
        throw new ExpressError(`Can't find company with code of ${code}`, 404)
      }
      return res.send({ company: results.rows[0] })
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