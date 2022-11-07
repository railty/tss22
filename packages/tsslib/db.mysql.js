const moment = require('moment');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const { config } = require('./config');
const { logger } = require('./winston');
const { loadPhoto, savePhoto } = require('./photos');

class DBMySQL{
  constructor(){
    this.dbConfig = config.mysql;
  }

  async getEmployees(updated_since, req_employee_limit){
    /*
    the timezone in sqlite is always UTC,
    the timezone in mysql is default to server, but configable by create /etc/mysql/mariadb.conf.d/timezone.cnf as
    ----
    [server]
    default-time-zone=+00:00	#UTC
    ----
    use SELECT @@global.time_zone, @@session.time_zone; to check current mysql timezone

    if we don't have UTC in MySQL, the problem is:
      the time queried from mysql is in UTC, that is good.
      sqlite create the time in UTC, that is good too.
      the time queried from sqlite is in UTC, that is good.
      mysql compare this time in UTC to its own timestamp in server timezone, that is wrong

      you cannot adjust the timezone youself, as it is so complicated, on top of the DST, every year is different etc..
      use moment to adjust

      updated_since_localtime = moment(updated_since_in_utc).format("YYYY-MM-DDTHH:mm:ss")
    */
    /*
    in the current setup, mysql is using local time zone, not utc.
    */
    logger.info('updated_since from client (in utc) = '+updated_since);
    updated_since = moment(updated_since).format("YYYY-MM-DDTHH:mm:ss")
    logger.info('updated_since in local zone = '+updated_since);

    const conn = await mysql.createConnection(this.dbConfig);
    /*
      why updated_at >= '${updated_since}', why not just '>' instead of '>='
      there might be multiple records with same timestamp, as we have a limit on the records return, we might only return
      some of these records in the first run, if we use > only, these records will never be returned

      the drawback is, even it is fully sychonized, server will still return lastest records, as it is = the timestamp on the client
    */
    /*
      updated at 2022/11/03
      this turns out to be a bugger problem, waste lots of band width
      in this perticular use case, there is no employee records, have the same updated_at timestamp, 
      so I am going to change the >= to >

      make sure
        select updated_at, count(*) from employees group by updated_at having count(*) > 1
      returns 0
    */
    let employee_limit = (config.sync.employeeLimit < req_employee_limit) ? config.sync.employeeLimit : req_employee_limit;
    let sql = `SELECT id, empno, store_id, barcode, name, name_cn, department, active, active2, created_at, updated_at 
      from employees 
      WHERE updated_at > '${updated_since}' 
      order by updated_at limit ${employee_limit}`;

    logger.info(sql);
    let [employees, fields] = await conn.query(sql);
    await conn.end();

    for(let emp of employees){
      emp.photoName = `${emp.id}.jpg`;
      let photo = `${config.photoPath}${emp.photoName}`;
      console.log(photo);
      emp.photo = await loadPhoto(photo);
      logger.info('emp.updated_at = '+emp.updated_at);
    }
    return employees;
  }

  async savePunches(punches){
    let results = [];

    const conn = await mysql.createConnection(this.dbConfig);
    for (let p of punches){
      //console.log(p);

      logger.info(p.time);
//transfer time is always in utc
//legacy mysql is in localtime
//future mysql should be in utc
      let created_at = moment.utc(p.created_at).local().format("YYYY-MM-DDTHH:mm:ss");
      let updated_at = moment.utc(p.updated_at).local().format("YYYY-MM-DDTHH:mm:ss");
      let time = moment.utc(p.time).local().format("YYYY-MM-DDTHH:mm:ss");

      let sql = `INSERT into punch.punches (id, time, employee_id, action, store, node, created_at, updated_at) values ('${p.id}', '${time}', ${p.employee_id}, '${p.action}', '${p.store}', '${p.node}', '${created_at}', '${updated_at}')`;
      logger.info(sql);

      //console.log(sql);
      try{
        let res = await conn.query(sql);

        let success = false;
        if (res && res[0] && res[0].affectedRows){
          if (res[0].affectedRows == 1){
            if (p.photo){
              let photoName = p.photo_name;
              photoName = photoName.match(/([^\/]*)$/)[1];
              photoName = config.camera.path + photoName;
              //photoName = "./tmp/" + photoName;
              console.log(photoName);
              await savePhoto(photoName, p.photo);
            }
            success = true;
          }
        }
        if (success) results.push(p.id);
      }
      catch(e){
	console.log("error:");
	console.log(e);

        logger.info("error:");
        logger.info(e);
        if (e.code == "ER_DUP_ENTRY") {
          results.push(p.id);
        }
      }
    }
    await conn.end();
    return results;
  }

  async savePunch(barcode){
    const conn = await mysql.createConnection(this.dbConfig);
    const [employees] = await conn.execute('SELECT id, empno, barcode, name, name_cn, department, active, active2 from employees WHERE `barcode` = ?', [barcode]);

    var punchAction;
    var punchId = uuidv4();

    if (employees.length > 0){
      //console.log(rows[0]);
      var tm = new Date();
      var dayStart = new Date(tm.getTime()); //make a copy of tm
      dayStart.setHours(config.startHour);
      dayStart.setMinutes(0);
      dayStart.setSeconds(0);
      dayStart.setMilliseconds(0);

      empId = employees[0].id;
      const [last_punches] = await conn.execute('SELECT * from punch.punches WHERE employee_id = ? and time >= ? and time < ? order by time desc limit 1', [empId, dayStart, tm]);
      //const sql = conn.format('SELECT * from punch.punches WHERE employee_id = ? and time >= ? and time < ? order by time desc limit 1', [empId, dayStart, tm]);
      //console.log(sql)

      /*
      I could change the state of the employee to in /out, which will make some reporting easier,
      however, due the the employee database no replicate back to hq, I chose not to do it.
      the general rule is, hq will update employee database, branch will update punch database
      */
      if (last_punches.length == 0) //first punch of the day
        punchAction = 'checkin'
      else
        punchAction = (last_punches[0].action == 'checkin') ? 'checkout' : 'checkin';

      await conn.execute('INSERT into punch.punches (id, time, employee_id, action, store, node, created_at, updated_at) values (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())', [punchId, tm, empId, punchAction, config.store, config.hostname]);
    }
    await conn.end();
    return {id: employees[0].id, name: employees[0].name, name_cn: employees[0].name_cn, empno:employees[0].empno, action: punchAction, punchId: punchId};
  }

}

exports.db = new DBMySQL();
