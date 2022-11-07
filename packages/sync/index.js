const axios = require('axios')
const fs = require('fs')
const https = require('https')

const { config } = require('tsslib/config');
//console.log(config);
const { logger } = require('tsslib/winston');
const { DBSQLite } = require('tsslib/db.sqlite3');
const { loadPhoto, savePhoto } = require('tsslib/photos');
const db = new DBSQLite();

let cert_file = fs.readFileSync("./cert/local/out/sync-server.cert");
let ca_file = fs.readFileSync("./cert/local/out/localCA.pem");
const agent = new https.Agent({
    requestCert: true,
    rejectUnauthorized: true,
    cert: cert_file,
    ca: ca_file
});

async function downloadEmployees(){
  let ts = db.getEmployeeTS();
  try{
    let res = await axios.get(`${config.sync.masterUrl}employees`, {
      params: {
        updated_since: ts,
        employee_limit: config.sync.employeeLimit,
      },
      headers: {Authorization: 'Auth'},
      maxContentLength: 50 *1024 * 1024,
      maxBodyLength: 50 *1024 * 1024,
      responseEncoding: 'utf8',
      timeout: 5 * 60 * 1000,
      httpsAgent : agent,
    });

    let employees = res.data.employees;
    logger.info(`downloading employees since ${ts}`);
    logger.info(`downloaded ${employees.length} employees`);
    for (let emp of employees){
      if (emp.photo){
        console.log(`saving ${config.photoPath}${emp.photoName}`);
        await savePhoto(`${config.photoPath}${emp.photoName}`, emp.photo);
      }
      delete emp.photo;
      delete emp.photoName;
      //console.log(emp);
      db.upsertEmployee(emp);
    }
  }
  catch(e){
    logger.info(e.toString());
  }
}

async function uploadPunches(){
  let punches = await db.getPunches();
  logger.info(`uploading ${punches.length} punches`);
  //logger.info(punches);
  try{
    logger.info(`${config.sync.masterUrl}punches`);
    
    let res = await axios.post(`${config.sync.masterUrl}punches`, {
      punches: punches,
      punch_limit: config.sync.punchLimit,
    }, {
      headers: {Authorization: 'Auth'},
      maxContentLength: 5 *1000 ** 3,
      maxBodyLength: 5 *1000 ** 3,
      timeout: 5 * 60 * 1000,
      httpsAgent : agent
    });
    let pids = res.data.results;
    let nSuccess = db.deletePunches(pids);
    console.log(`uploaded ${nSuccess} punches`);
    db.purgePunches(pids);
  }
  catch(e){
    console.log(e.toString());
  }
}


async function sync(){
  await downloadEmployees();
  await uploadPunches();

  setInterval(await downloadEmployees, config.sync.intervalDlEmployees);
  setInterval(await uploadPunches, config.sync.intervalUlPunches);
}

async function fastSync2(){
  let n = Array(100).fill(1).map((x, y) => x + y);
  for (let i of n){
    await Utils.downloadEmployees();
    //await Utils.uploadPunches();
  }
}

async function fastSync(){
  await Utils.downloadEmployees();
  //await Utils.uploadPunches();
}

sync();
//fastSync();