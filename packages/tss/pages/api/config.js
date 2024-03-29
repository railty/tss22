export default async function handler(req, res) {
  const { logger } = require("tsslib/winston");
  const fs = require('fs/promises');
  const { DBSQLite } = require('tsslib/db.sqlite3');
  const db = new DBSQLite();
  
  if (req.method == "GET"){
    logger.info("get api/config");

    let config = await fs.readFile('../../config.json');
    config = JSON.parse(config);

    res.status(200).json(config);
    /*
    res.status(200).json({
      store: config.store,
      storeId: config.storeId
    })
    */
  }

  if (req.method == "PATCH"){
    logger.info("patch api/config");
    let config = await fs.readFile('../../config.json');
    config = JSON.parse(config);
    //console.log("config:", config);
    const newConfig = {...config, ...req.body};
    await fs.writeFile('../../config.json', JSON.stringify(newConfig, null, 2), "utf-8");
    //console.log("newConfig:", newConfig);
    
    db.upsertStore(newConfig.storeId, newConfig.store);

    res.status(200).json({
      msg: `OK`,
    })
  }
}

