// Tell Node that we're in test "mode"
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');
const slugify = require("slugify");

beforeEach(async () => {
  const resultCompany = await db.query(`INSERT INTO companies (code, name, description) VALUES ('comp1', 'nur1', 'number 1 company') RETURNING code, name, description`);
  testCompany = resultCompany.rows[0]
  const resultInvoice = await db.query(
    `INSERT INTO invoices (comp_code, amt)
    VALUES ('comp1', '900') 
    RETURNING id, comp_code, amt, paid, add_date, paid_date`);
  testInvoice = resultInvoice.rows[0]

})

afterEach(async () => {
  await db.query(`DELETE FROM companies`)
  await db.query(`DELETE FROM invoices`)
})

afterAll(async () => {
  await db.end()
})

// COMPANIES ROUTES

describe("GET /companies", () => {
    test("Get a list of testCompany", async () => {
      const res = await request(app).get('/companies')
      expect(res.statusCode).toBe(200);
      const { name, code } = testCompany;
      const expectedCompany = { name, code };
      expect(res.body).toEqual({ companies: [expectedCompany] })
    })
})

describe("GET /companies/:code", () => {
    test("Get the testCompany", async () => {
      const res = await request(app).get('/companies/comp1')
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ company: testCompany })
    })
    test("Responds with 404 for invalid code", async () => {
        const res = await request(app).get('/companies/comp')
        expect(res.statusCode).toBe(404);
    })
})

describe("POST /companies", () => {
    test("Post a company to database", async () => {
      const res = await request(app).post('/companies').send({code:'comp2', name:'nur2', description:'company'})
      const code = slugify('nur2', {lower: true});
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ company: {code:code, name:'nur2', description:'company'} })
    })
})

describe("PUT /companies", () => {
    test("Put a company to database", async () => {
      const res = await request(app).put('/companies/comp1').send({ name:'nur', description:'company' })
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ company:{code:'comp1', name:'nur', description:'company' }  })
    })
    test("Responds with 404 for invalid code", async () => {
        const res = await request(app).put('/companies/comp').send({ name:'nur', description:'company' })
        expect(res.statusCode).toBe(404);
    })
})

describe("DELETE /companies/:code", () => {
    test("Delete the testCompany", async () => {
      const res = await request(app).delete('/companies/comp1')
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ status: "DELETED" })
    })
})

// INVOICES ROUTES

describe("GET /invoices", () => {
    test("Get a list of testInvoice", async () => {
      const res = await request(app).get('/invoices')
      expect(res.statusCode).toBe(200);
      const { id, comp_code } = testInvoice;
      const expectedInvoices = { id, comp_code };
      expect(res.body).toEqual({ invoices: [expectedInvoices] })
    })
})

describe("GET /invoices/:id", () => {
    test("Get testInvoice", async () => {
        const res = await request(app).get(`/invoices/${testInvoice.id}`)
        expect(res.statusCode).toBe(200);
        const { description } = testCompany;
        const expectedCompany = { description };
        const { id, comp_code, amt, paid } = testInvoice;
        
        const expectedInvoice = { id, comp_code, amt, paid, ...expectedCompany};
        
        expect(res.body).toEqual({ invoice: [expectedInvoice] })
    })
    test("Responds with 404 for invalid id", async () => {
            const res = await request(app).get('/invoices/0')
            expect(res.statusCode).toBe(404);
        })
})

describe("POST /invoices", () => {
    test("Post a invoice to database", async () => {
      const res = await request(app).post('/invoices').send({comp_code:`${testCompany.code}`, amt:'500' })
      expect(res.statusCode).toBe(201);
      
      expect(res.body).toEqual({ invoice: [{id: expect.any(Number), comp_code:`${testCompany.code}`, amt:500, add_date:new Date(Date.parse(res.body.invoice[0].add_date)).toISOString(), paid: false, paid_date: null, }]})
    })
})

describe("PUT /invoices/:id", () => {
    test("Put invoice to update", async () => {
      const res = await request(app).put(`/invoices/${testInvoice.id}`).send({ amt:'900' })
      expect(res.statusCode).toBe(200);
      
      expect(res.body).toEqual({ invoice: [{id: expect.any(Number), comp_code:`${testCompany.code}`, amt:900, add_date:new Date(Date.parse(res.body.invoice[0].add_date)).toISOString(), paid: false, paid_date: null, }]})
    })
    test("Put invoice to update while paying", async () => {
        const res = await request(app).put(`/invoices/${testInvoice.id}`).send({ amt:'900', paid:'true' })
        expect(res.statusCode).toBe(200);
        
        expect(res.body).toEqual({ invoice: [{id: expect.any(Number), comp_code:`${testCompany.code}`, amt:900, add_date:new Date(Date.parse(res.body.invoice[0].add_date)).toISOString(), paid: true, paid_date: new Date(Date.parse(res.body.invoice[0].add_date)).toISOString() }]})
      })
    test("Responds with 404 for invalid id", async () => {
        const res = await request(app).put(`/invoices/0`).send({ amt:'900' })
        expect(res.statusCode).toBe(404);
    })
})

describe("DELETE /invoices/:id", () => {
    test("Delete the testInvoice", async () => {
      const res = await request(app).delete(`/invoices/${testInvoice.id}`)
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ status: "deleted" })
    })
})