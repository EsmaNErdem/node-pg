// Routes for invoices of biztime db

const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT id, comp_code FROM invoices`);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoices`, 404)
          }
        return res.json({ invoices: results.rows })
    } catch (e) {
        return next(e);
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query(
            `SELECT i.id, i.comp_code, i.amt, i.paid, c.description
            FROM invoices AS i
            INNER JOIN companies AS c on(i.comp_code = c.code)
            WHERE id = $1`, [id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404)
          }
        return res.json({ invoice: results.rows })
    } catch (e) {
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt} = req.body;
        const results = await db.query(
            `INSERT INTO invoices (comp_code, amt)
            VALUES ($1, $2) 
            RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't push invoice into database`, 404)
          }
        return res.status(201).json({ invoice: results.rows })
    } catch (e) {
        return next(e);
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        let { amt, paid } = req.body;
        let paidDate = null
        const currResult = await db.query(
            `SELECT *
            FROM invoices
            WHERE id = $1`, [id]);
        if (currResult.rows.length === 0) {
            throw new ExpressError(`Can't update invoice with id of ${id}`, 404)
        }
        
        const currPaidDate = currResult.rows[0].paid_date
        if(!currPaidDate && paid){
            paidDate = new Date();
        } else if (!paid) {
            paidDate =  null
            paid = false
        } else {
            paidDate = currPaidDate
        }
        const results = await db.query(
            `UPDATE invoices
            SET amt=$2, paid=$3, paid_date=$4
            WHERE id = $1
            RETURNING id, comp_code, amt, paid, add_date, paid_date`, [id, amt, paid, paidDate]);
        return res.json({ invoice: results.rows })
    } catch (e) {
        return next(e);
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query(`DELETE FROM invoices WHERE id = $1`, [id]);
        return res.json({ status: "deleted" })
    } catch (e) {
        return next(e);
    }
})

module.exports = router;