var express = require('express');
var router = express.Router();

const { db } = require('tsslib/db.mysql');

/* GET users listing. */
router.get('/', async function(req, res, next) {
  let updated_since = req.query.updated_since;
  let req_employee_limit = req.query.employee_limit;
  console.log(`request for employees since ${updated_since} for ${req_employee_limit}`);
  let employees = await db.getEmployees(updated_since, req_employee_limit);
  //console.log(employees);
  console.log(`response with ${employees.length} employees`);
  res.json({ employees: employees });
});

module.exports = router;
