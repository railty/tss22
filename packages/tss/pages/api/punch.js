const { config } = require("tsslib/config");
const { getGitVersion, getIPs } = require("tsslib");
const { DBSQLite } = require('tsslib/db.sqlite3');
const db = new DBSQLite();
const fs = require('fs');

export default async function handler(req, res) {
  let barcode = req.body.employee.barcode;
  let canvas = req.body.employee.canvas;
  let employee = await db.savePunch(barcode, canvas);
  console.log("punch saved");
  res.send(JSON.stringify(employee));
}

