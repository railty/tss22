const fs = require('fs/promises');
const { logger } = require('./winston');

exports.loadPhoto = async function (file) {
  try{
    var binary = await fs.readFile(file);
    return Buffer.from(binary).toString('base64');
  }
  catch(e){
    logger.info(e);
    return null;
  }
}

exports.savePhoto =  async function (fileName, base64Data) {
  await fs.writeFile(fileName, base64Data, 'base64');
}
