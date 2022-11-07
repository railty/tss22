const fs = require('fs/promises');
const axios = require('axios')
const moment = require('moment');
const child_process_exec = require('child_process').exec;
const util = require('util');
const exec = util.promisify(child_process_exec);

const { config } = require('./config');

exports.uploadPunches = async function (){
  let punches = await db.getPunches();
  winston.info(`uploading ${punches.length} punches`);
  //winston.info(punches);
  try{
    winston.info(`${config.sync.masterUrl}punches`);
    
    let res = await axios.post(`${config.sync.masterUrl}punches`, {
      punches: punches,
      punch_limit: config.sync.punchLimit,
      //key: fs.readFileSync('./tss.vpnhub.center/privkey.pem'),
      //cert: fs.readFileSync('./tss.vpnhub.center/fullchain.pem'),
    }, {
      headers: {Authorization: 'Auth'},
      maxContentLength: 5 *1000 ** 3,
      maxBodyLength: 5 *1000 ** 3,
      timeout: 5 * 60 * 1000
    });
    let pids = res.data.results;
    let nSuccess = await db.deletePunches(pids);
    console.log(`uploaded ${nSuccess} punches`);
    await db.purgePunches(pids);
  }
  catch(e){
    console.log(e.toString());
  }
}

exports.getGitVersion = async function() {
  const { stdout, stderr } = await exec("git log -1 --format=%cd");
  let res = stdout;
  res = res.replace(/\s+/g, ' ').trim();
  res = moment(new Date(res)).format("YYYY-MM-DDTHH:mm:ss")

  return res;
}

exports.getIPs =  function() {
  const os = require('os');
  const ifaces = os.networkInterfaces();
  //console.log(ifaces);
  let allIPs = [];

  Object.keys(ifaces).forEach((ifname) => {
    //console.log('['+ifname+']');
    if (ifname != 'lo' && ifname != 'Loopback Pseudo-Interface 1'){
      //console.log(ifaces[ifname]);
      let ips = ifaces[ifname].filter((iface)=>{
        return iface['family'] == 'IPv4';
      }).map((iface)=>{
        return iface['address'];
      });
      allIPs = allIPs.concat(ips);
    }
  });
  //console.log(allIPs);
  return allIPs.join(', ');
}
