const { config } = require("tsslib/config");
const { getGitVersion, getIPs } = require("tsslib");
const { DBSQLite } = require('tsslib/db.sqlite3');
const db = new DBSQLite();

export default async function handler(req, res) {
  const ips = getIPs();
  const version = await getGitVersion();
  let stat = await db.getDbStats();

  stat = `E:${stat.employees}|P:${stat.punches}|PU:${stat.uploaded_punches}`;

  res.status(200).json({
    store: `${config.store}|${config.storeId}|${config.hostname}`,
    status: 'OK',
    version: version,
    ips: ips,
    db: stat
  })
}

