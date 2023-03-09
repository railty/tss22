const moment = require('moment');
const child_process_exec = require('child_process').exec;
const util = require('util');
const exec = util.promisify(child_process_exec);

const { config } = require('./config');

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
