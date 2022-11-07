var express = require('express');
var router = express.Router();

const { db } = require('tsslib/db.mysql');

/* GET users listing. */
router.get('/', async (req, res) => {
  let updated_since = req.query.updated_since;
  let req_employee_limit = req.query.employee_limit;
  console.log(`request for employees since ${updated_since} for ${req_employee_limit}`);
  let employees = await db.getEmployees(updated_since, req_employee_limit);
  //console.log(employees);
  console.log(`response with ${employees.length} employees`);
  res.json({ employees: employees });
});



router.post('/', async (req, res)=>{
  let punches = req.body.punches;
  console.log(`received ${punches.length} punches`);
  let results = await db.savePunches(punches);
  console.log(`saved ${results.length} punches`);
  res.setHeader('Content-Type', 'application/json');
  res.json({results: results});
})

module.exports = router;
