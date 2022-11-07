const moment = require('moment');
const sqlite = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

const { config } = require("./config");
const { savePhoto, loadPhoto } = require("./photos");
const { logger } = require("./winston");

exports.DBSQLite = class {
  constructor(){
    this.tss = sqlite(config.sqlite.tss);
    this.punch = sqlite(config.sqlite.punch);
  }

  getDbStats(){
    let res = this.tss.prepare(`SELECT count(*) as ct from employees`).get();
    let ctEmployees = res.ct;

    res = this.punch.prepare(`SELECT count(*) as ct from punches`).get();
    let ctPunches = res.ct;

    res = this.punch.prepare(`SELECT count(*) as ct from punches where state = 'uploaded'`).get();
    let ctUploadedPunches = res.ct;
    
    return {
      employees: ctEmployees,
      punches: ctPunches,
      uploaded_punches: ctUploadedPunches
    }
  }

  upsertEmployee(emp){
    let rows = this.tss.prepare(`SELECT * from employees where id = ${emp.id}`).all();
    if (rows.length>0){
      console.log(`update ${emp.id} ${emp.updated_at}`);
      let res = this.tss.prepare('update employees set store_id = ?, empno = ?, barcode = ?, name = ?, name_cn = ?, department = ?, active = ?, active2 = ?, created_at = ?, updated_at = ? where id = ?')
        .run(emp.store_id, emp.empno, emp.barcode, emp.name, emp.name_cn, emp.department, emp.active, emp.active2, emp.created_at, emp.updated_at, emp.id);
      //console.log(res);
    }
    else{
      console.log(`insert ${emp.id} ${emp.updated_at}`);
      let res = this.tss.prepare('insert into employees(store_id, id, empno, barcode, name, name_cn, department, active, active2, created_at, updated_at) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(emp.store_id, emp.id, emp.empno, emp.barcode, emp.name, emp.name_cn, emp.department, emp.active, emp.active2, emp.created_at, emp.updated_at);
      //console.log(res);
    }
  }

  getEmployeeTS(){
    let ts = this.tss.prepare('SELECT max(updated_at) as updated_at from employees').get();
    let updated_since = ts.updated_at || new Date('2000-01-01');
    console.log(updated_since);
    return updated_since;
  }

  async getPunches(){
    let punches = this.punch.prepare(`SELECT * from punches WHERE state is null order by created_at limit ${config.sync.punchLimit}`).all();
    //await array.map must be wrapped in Promise.all
    //Utils is not avaviable inside map function
    /*
    punches = await Promise.all(punches.map(async (p)=>{
      console.log(Utils);
      if (p.photo_name) p.photo = await Utils.loadPhoto(p.photo_name);
      return p;
    }));
    */
    for (let p of punches){
      if (p.photo_name) p.photo = await loadPhoto(p.photo_name);
    }
    //console.log(punches);
    return punches;
  }

  deletePunches(pids){
    let nSuccess = 0;
    for(let pid of pids){
      let res = this.punch.prepare("update punches set state = 'uploaded' WHERE id = ?").run([pid]);

      if (res && res.changes && res.changes == 1) nSuccess++;
    }
    return nSuccess;
  }

  purgePunches(){
    let sql = `delete from punches WHERE state = 'uploaded' and (julianday('now') - julianday(updated_at)) > ${config.sync.punchExpiredDays}`;
    this.punch.prepare(sql).run();
  }

  async savePunch(barcode, canvas){
    //const employees = await tss.all('SELECT id, empno, barcode, name, name_cn, department, active, active2 from employees WHERE barcode = ?', [barcode]);
    //only local store employee can punch
    let sql = `SELECT id, empno, barcode, name, name_cn, department, active, active2 from employees WHERE store_id = ${config.storeId} and barcode = '${barcode}'`;
    logger.info(sql);
    const employees = this.tss.prepare(sql).all();

    var punchAction;
    var punchId = uuidv4();
    let rc = {};
    if (employees.length > 0){
      let tm = new Date();
      let dayStart = new Date(tm.getTime()); //make a copy of tm
      dayStart.setHours(config.startHour);
      dayStart.setMinutes(0);
      dayStart.setSeconds(0);
      dayStart.setMilliseconds(0);
      dayStart = moment(dayStart).utc().format("YYYY-MM-DDTHH:mm:ss");
      tm = moment(tm).utc().format("YYYY-MM-DDTHH:mm:ss");

      let empId = employees[0].id;
      let active = employees[0].active;

      rc = {
        status: 'OK',
        id: employees[0].id,
        name: employees[0].name,
        name_cn: employees[0].name_cn,
        empno:employees[0].empno,
        active: employees[0].active
      };

      if (empId && active){
        let sql = `SELECT * from punches WHERE employee_id = ${empId} and time >= '${dayStart}' and time < '${tm}' order by time desc limit 1`;
        logger.info("saving punch");
        logger.info(sql);
        const last_punches = this.punch.prepare(sql).all();
        /*
        I could change the state of the employee to in /out, which will make some reporting easier,
        however, due the the employee database no replicate back to hq, I chose not to do it.
        the general rule is, hq will update employee database, branch will update punch database
        */
  
        if (last_punches.length == 0) //first punch of the day
          punchAction = 'checkin'
        else
          punchAction = (last_punches[0].action == 'checkin') ? 'checkout' : 'checkin';
  
        let photoName = "";
        if (canvas){
          let regex = /^data:.+\/(.+);base64,(.*)$/;
          let matches = canvas.match(regex);
          let ext = matches[1];
          let data = matches[2];
          let buffer = Buffer.from(data, 'base64');
  
          photoName = config.camera.path + punchId + '.' + ext;
          logger.info(`saving photo as ${photoName}`);
          await savePhoto(photoName, buffer);
        }
  
        let res = this.punch.prepare('INSERT into punches(id, time, employee_id, action, store, node, photo_name, created_at, updated_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?)').run([punchId, tm, empId, punchAction, config.store, config.hostname, photoName, tm, tm]);
        if (res && res.changes && res.changes == 1){
          //console.log('OK');
          rc = {
            status: 'OK',
            id: employees[0].id,
            name: employees[0].name,
            name_cn: employees[0].name_cn,
            empno:employees[0].empno,
            action: punchAction,
            punchId: punchId,
            active: employees[0].active
          };
        }
        else{
          console.log('cannot save punch');
          rc = {status: 'cannot save punch'};
        }
      }
    }
    else rc = {status: 'no employee found'};

    return rc;
  }
}

