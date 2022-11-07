const { logger } = require("tsslib/winston");
const { DBMySQL } = require('tsslib/db.mysql');
const db = new DBMySQL();

export default async function handler(req, res) {
  let updated_since = req.query.updated_since;
  let req_employee_limit = req.query.employee_limit;
  logger.info(`request for employees since ${updated_since} for ${req_employee_limit}`);
  let employees = await db.getEmployees(updated_since, req_employee_limit);
  console.log(employees);
  logger.info(`response with ${employees.length} employees`);
  
  res.status(200).json({ employees: employees });
}
